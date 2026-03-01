<?php

namespace App\Services\BookReturn;

use App\Helpers\ActivityLogger;
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
    public function getReturnsByBorrow(Borrow $borrow): Collection
    {
        return BookReturn::with(['details.bookCopy.book'])
            ->where('borrow_id', $borrow->id)
            ->latest()
            ->get();
    }

    public function createReturn(Borrow $borrow, array $data): BookReturn
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

    public function approveReturn(BookReturn $bookReturn): BookReturn
    {
        $borrow = $bookReturn->borrow;

        DB::transaction(function () use ($borrow, $bookReturn) {
            foreach ($bookReturn->details as $detail) {
                $bookCopy = $detail->bookCopy;
                $oldStatus = $bookCopy->status;

                $newStatus = match($detail->condition) {
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

    public function canCreateReturn(Borrow $borrow): bool
    {
        return $borrow->status === 'open';
    }

    public function canApproveReturn(BookReturn $bookReturn): bool
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
