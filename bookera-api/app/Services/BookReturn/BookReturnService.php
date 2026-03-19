<?php

namespace App\Services\BookReturn;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\Fine;
use App\Models\FineType;
use App\Events\ReturnRequested;
use App\Events\ReturnApproved;
use App\Events\FineCreated;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BookReturnService
{
    public function getByBorrow(Borrow $borrow): Collection
    {
        return BookReturn::with(['details.bookCopy.book'])
            ->where('borrow_id', $borrow->id)
            ->latest()
            ->orderByDesc('id')
            ->get();
    }

    public function create(Borrow $borrow, array $data): BookReturn
    {
        return DB::transaction(function () use ($borrow, $data) {
            $return = BookReturn::create([
                'borrow_id'   => $borrow->id,
                'return_date' => now(),
            ]);

            $returnedCopies = [];

            foreach ($data['borrow_detail_ids'] as $detailId) {
                $borrowDetail = BorrowDetail::where('id', $detailId)
                    ->where('borrow_id', $borrow->id)
                    ->where('status', 'borrowed')
                    ->firstOrFail();

                $bookCopy = $borrowDetail->bookCopy;

                $return->details()->create([
                    'book_copy_id' => $bookCopy->id,
                    'condition'    => 'good',
                ]);

                $returnedCopies[] = [
                    'copy_id'          => $bookCopy->id,
                    'book_title'       => $bookCopy->book->title ?? 'Unknown',
                    'borrow_detail_id' => $detailId,
                ];

                ActivityLogger::log(
                    'create',
                    'book_return_detail',
                    "Return requested for book copy #{$bookCopy->id} ({$bookCopy->book->title})",
                    ['copy_id' => $bookCopy->id, 'borrow_detail_id' => $detailId],
                    null,
                    $bookCopy
                );
            }

            $return->load(['details.bookCopy.book']);

            ActivityLogger::log(
                'create',
                'book_return',
                "Return requested for borrow #{$borrow->id} with " . count($returnedCopies) . " book(s)",
                [
                    'return_id'       => $return->id,
                    'borrow_id'       => $borrow->id,
                    'return_date'     => $return->return_date,
                    'returned_copies' => $returnedCopies,
                ],
                null,
                $return
            );

            event(new ReturnRequested($return));

            return $return;
        });
    }

    public function approve(BookReturn $bookReturn): BookReturn
    {
        $borrow = $bookReturn->borrow;

        // Prevent approving if there are unpaid fines
        $unpaidFines = $borrow->fines()->where('status', 'unpaid')->count();
        if ($unpaidFines > 0) {
            throw new \Exception('Tidak dapat menyelesaikan pengembalian. Masih ada ' . $unpaidFines . ' denda yang belum dibayar.');
        }

        DB::transaction(function () use ($borrow, $bookReturn) {
            foreach ($bookReturn->details as $detail) {
                $bookCopy = $detail->bookCopy;
                $oldStatus = $bookCopy->status;

                $newStatus = match ($detail->condition) {
                    'good'    => 'available',
                    'damaged' => 'damaged',
                    'lost'    => 'lost',
                    default   => 'available'
                };

                $bookCopy->update(['status' => $newStatus]);

                // Update corresponding borrow_detail status
                $borrowDetail = BorrowDetail::where('borrow_id', $borrow->id)
                    ->where('book_copy_id', $bookCopy->id)
                    ->where('status', 'borrowed')
                    ->first();

                if ($borrowDetail) {
                    $borrowDetail->update(['status' => 'returned']);
                }

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$bookCopy->id} status changed to '{$newStatus}' (condition: {$detail->condition})",
                    ['copy_id' => $bookCopy->id, 'new_status' => $newStatus, 'condition' => $detail->condition],
                    ['copy_id' => $bookCopy->id, 'old_status' => $oldStatus],
                    $bookCopy
                );
            }

            // Close borrow if all borrow_details are returned or lost
            $allDone = BorrowDetail::where('borrow_id', $borrow->id)
                ->where('status', 'borrowed')
                ->doesntExist();

            if ($allDone) {
                $oldBorrowStatus = $borrow->status;
                $borrow->update(['status' => 'close']);

                ActivityLogger::log(
                    'update',
                    'borrow',
                    "Borrow #{$borrow->id} closed - all books returned/lost",
                    ['borrow_id' => $borrow->id, 'new_status' => 'close'],
                    ['borrow_id' => $borrow->id, 'old_status' => $oldBorrowStatus],
                    $borrow
                );
            }

            event(new ReturnApproved($bookReturn));
        });

        return $bookReturn->load('details.bookCopy.book', 'borrow');
    }

    /**
     * Update conditions for book return details and auto-create fines for damaged books.
     */
    public function updateConditions(BookReturn $bookReturn, array $conditions): BookReturn
    {
        return DB::transaction(function () use ($bookReturn, $conditions) {
            $borrow = $bookReturn->borrow;

            foreach ($conditions as $detailId => $condition) {
                $detail = $bookReturn->details()->find($detailId);
                if (!$detail) {
                    continue;
                }

                $oldCondition = $detail->condition;
                $detail->update(['condition' => $condition]);

                // Auto-create fine for damaged books
                if ($condition === 'damaged' && $oldCondition !== 'damaged') {
                    $this->autoCreateDamagedFine($borrow, $detail->bookCopy);
                }

                ActivityLogger::log(
                    'update',
                    'book_return_detail',
                    "Return detail #{$detail->id} condition updated to '{$condition}'",
                    ['detail_id' => $detail->id, 'new_condition' => $condition],
                    ['detail_id' => $detail->id, 'old_condition' => $oldCondition],
                    $detail
                );
            }

            return $bookReturn->fresh(['details.bookCopy.book', 'borrow.fines.fineType']);
        });
    }

    private function autoCreateDamagedFine(Borrow $borrow, BookCopy $bookCopy): void
    {
        $damagedFineType = FineType::where('type', 'damaged')->first();
        if (!$damagedFineType) {
            return;
        }

        $fineNotes = 'Denda buku rusak: ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

        $existingFine = $borrow->fines()
            ->where('notes', $fineNotes)
            ->first();

        if ($existingFine) {
            return;
        }

        $fine = Fine::create([
            'borrow_id'    => $borrow->id,
            'fine_type_id' => $damagedFineType->id,
            'amount'       => $damagedFineType->amount,
            'status'       => 'unpaid',
            'notes'        => $fineNotes,
        ]);

        ActivityLogger::log(
            'create',
            'fine',
            "Fine auto-created for damaged book in borrow #{$borrow->id}",
            ['fine_id' => $fine->id, 'amount' => $fine->amount, 'book_copy_id' => $bookCopy->id],
            null,
            $fine
        );

        $fine->load('fineType', 'borrow.user', 'borrow.borrowDetails.bookCopy.book');
        event(new FineCreated($fine));
    }

    /**
     * Mark all unpaid fines for this return's borrow as paid.
     */
    public function finishFines(BookReturn $bookReturn): array
    {
        $borrow = $bookReturn->borrow;

        $unpaidFines = $borrow->fines()->where('status', 'unpaid')->get();

        if ($unpaidFines->isEmpty()) {
            throw new \Exception('Tidak ada denda yang belum dibayar untuk peminjaman ini.');
        }

        DB::transaction(function () use ($unpaidFines, $borrow) {
            foreach ($unpaidFines as $fine) {
                $fine->update([
                    'status'  => 'paid',
                    'paid_at' => now(),
                ]);

                ActivityLogger::log(
                    'update',
                    'fine',
                    "Fine #{$fine->id} marked as paid via return finish-fines",
                    ['fine_id' => $fine->id, 'status' => 'paid', 'paid_at' => $fine->paid_at],
                    ['status' => 'unpaid'],
                    $fine
                );
            }
        });

        return $borrow->fines()->with('fineType')->get()->toArray();
    }

    /**
     * Get detailed return info including borrow details and fines.
     */
    public function getDetail(BookReturn $bookReturn): BookReturn
    {
        return $bookReturn->load([
            'details.bookCopy.book',
            'borrow.user.profile',
            'borrow.fines.fineType',
            'borrow.borrowDetails.bookCopy.book',
        ]);
    }

    public function canCreate(Borrow $borrow): bool
    {
        return $borrow->status === 'open';
    }

    public function canApprove(BookReturn $bookReturn): bool
    {
        $borrow = $bookReturn->borrow;

        if ($borrow->status !== 'open') {
            return false;
        }

        return true;
    }

    public function processFine(BookReturn $bookReturn): Fine
    {
        return DB::transaction(function () use ($bookReturn) {
            $borrow = $bookReturn->borrow;

            $hasDamagedBooks = $bookReturn->details()
                ->where('condition', 'damaged')
                ->exists();

            if (!$hasDamagedBooks) {
                throw new \Exception('Tidak ada buku yang rusak pada peminjaman ini');
            }

            $existingFine = $borrow->fines()
                ->where('status', 'unpaid')
                ->first();

            if ($existingFine) {
                throw new \Exception('Sudah ada denda yang belum dibayar untuk peminjaman ini');
            }

            $damagedFineType = FineType::where('type', 'damaged')->first();

            if (!$damagedFineType) {
                throw new \Exception('Tipe denda untuk buku rusak tidak ditemukan');
            }

            $fine = Fine::create([
                'borrow_id'    => $borrow->id,
                'fine_type_id' => $damagedFineType->id,
                'amount'       => $damagedFineType->amount,
                'status'       => 'unpaid',
            ]);

            ActivityLogger::log(
                'create',
                'fine',
                "Fine created for damaged book(s) in borrow #{$borrow->id}",
                ['fine_id' => $fine->id, 'amount' => $fine->amount],
                null,
                $fine
            );

            $fine->load('fineType', 'borrow.user', 'borrow.borrowDetails.bookCopy.book');

            event(new FineCreated($fine));

            return $fine;
        });
    }
}
