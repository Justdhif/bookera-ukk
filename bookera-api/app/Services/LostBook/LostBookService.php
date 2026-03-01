<?php

namespace App\Services\LostBook;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Borrow;
use App\Models\Fine;
use App\Models\FineType;
use App\Models\LostBook;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class LostBookService
{
    public function getAllLostBooks(?string $search = null): Collection
    {
        $query = LostBook::with([
            'borrow.user.profile',
            'borrow.fines.fineType',
            'bookCopy.book',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('borrow_id', 'like', "%{$search}%")
                    ->orWhereHas('borrow.user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function reportLostBook(Borrow $borrow, array $data): LostBook
    {
        return DB::transaction(function () use ($borrow, $data) {
            $lostBook = LostBook::create([
                'borrow_id'           => $borrow->id,
                'book_copy_id'        => $data['book_copy_id'],
                'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                'notes'               => $data['notes'] ?? null,
            ]);

            $bookCopy  = BookCopy::find($data['book_copy_id']);
            $oldStatus = $bookCopy->status;

            $bookCopy->update(['status' => 'lost']);

            $borrowDetail = $borrow->borrowDetails()
                ->where('book_copy_id', $data['book_copy_id'])
                ->first();
            if ($borrowDetail) {
                $borrowDetail->update(['status' => 'lost']);
            }

            ActivityLogger::log(
                'update',
                'book_copy',
                "Book copy #{$bookCopy->id} ({$bookCopy->book->title}) reported as lost",
                [
                    'copy_id'    => $bookCopy->id,
                    'new_status' => 'lost',
                    'borrow_id'  => $borrow->id,
                ],
                [
                    'copy_id'    => $bookCopy->id,
                    'old_status' => $oldStatus,
                ],
                $bookCopy
            );

            ActivityLogger::log(
                'create',
                'lost_book',
                "Lost book reported for borrow #{$borrow->id}",
                [
                    'lost_book_id'        => $lostBook->id,
                    'borrow_id'           => $borrow->id,
                    'book_copy_id'        => $data['book_copy_id'],
                    'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                ],
                null,
                $lostBook
            );

            $lostBook->load(['borrow.user.profile', 'bookCopy.book']);

            event(new \App\Events\LostBookReported($lostBook));

            return $lostBook;
        });
    }

    public function updateLostBook(LostBook $lostBook, array $data): LostBook
    {
        $lostBook->update($data);

        ActivityLogger::log(
            'update',
            'lost_book',
            "Lost book #{$lostBook->id} information updated",
            [
                'lost_book_id' => $lostBook->id,
                'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ],
            null,
            $lostBook
        );

        return $lostBook->load(['borrow.user.profile', 'bookCopy.book']);
    }

    public function deleteLostBook(LostBook $lostBook): void
    {
        $bookCopy = $lostBook->bookCopy;

        ActivityLogger::log(
            'delete',
            'lost_book',
            "Lost book record #{$lostBook->id} deleted",
            [
                'lost_book_id' => $lostBook->id,
                'borrow_id'    => $lostBook->borrow_id,
                'book_copy_id' => $lostBook->book_copy_id,
            ],
            null,
            $lostBook
        );

        $lostBook->delete();

        if ($lostBook->borrow->status === 'open') {
            $bookCopy->update(['status' => 'borrowed']);
        }
    }

    public function finishLostBookProcess(LostBook $lostBook): LostBook
    {
        $borrow = $lostBook->borrow;

        DB::transaction(function () use ($borrow, $lostBook) {
            $allFinished = $borrow->borrowDetails()
                ->whereNotIn('status', ['returned', 'lost'])
                ->doesntExist();

            if ($allFinished) {
                $oldStatus = $borrow->status;
                $borrow->update(['status' => 'close']);

                ActivityLogger::log(
                    'update',
                    'borrow',
                    "Borrow #{$borrow->id} closed - all books accounted for",
                    [
                        'borrow_id'    => $borrow->id,
                        'new_status'   => 'close',
                        'lost_book_id' => $lostBook->id,
                    ],
                    [
                        'borrow_id'  => $borrow->id,
                        'old_status' => $oldStatus,
                    ],
                    $borrow
                );
            }
        });

        return $lostBook->load(['borrow.user.profile', 'bookCopy.book']);
    }

    public function canReportLost(Borrow $borrow, int $bookCopyId): array
    {
        if ($borrow->status !== 'open') {
            return [false, 'Peminjaman ini tidak dalam status open'];
        }

        $borrowDetail = $borrow->details()->where('book_copy_id', $bookCopyId)->first();

        if (!$borrowDetail) {
            return [false, 'Buku ini tidak termasuk dalam peminjaman'];
        }

        $existingLostBook = LostBook::where('borrow_id', $borrow->id)
            ->where('book_copy_id', $bookCopyId)
            ->first();

        if ($existingLostBook) {
            return [false, 'Buku ini sudah dilaporkan hilang'];
        }

        return [true, ''];
    }

    public function canFinish(LostBook $lostBook): array
    {
        $borrow = $lostBook->borrow;

        $unpaidFines = $borrow->fines()->where('status', 'unpaid')->count();
        if ($unpaidFines > 0) {
            return [false, 'Tidak dapat menyelesaikan proses buku hilang. Masih ada denda yang belum dibayar.'];
        }

        return [true, ''];
    }

    public function processFine(LostBook $lostBook): Fine
    {
        return DB::transaction(function () use ($lostBook) {
            $borrow   = $lostBook->borrow;
            $bookCopy = $lostBook->bookCopy;

            $existingFine = $borrow->fines()
                ->where('status', 'unpaid')
                ->first();

            if ($existingFine) {
                throw new \Exception('Sudah ada denda yang belum dibayar untuk peminjaman ini');
            }

            $lostFineType = FineType::where('type', 'lost')->first();

            if (!$lostFineType) {
                throw new \Exception('Tipe denda untuk buku hilang tidak ditemukan');
            }

            $fine = Fine::create([
                'borrow_id'    => $borrow->id,
                'fine_type_id' => $lostFineType->id,
                'amount'       => $lostFineType->amount,
                'status'       => 'unpaid',
                'notes'        => 'Denda buku hilang: ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')',
            ]);

            ActivityLogger::log(
                'create',
                'fine',
                "Fine created for lost book in borrow #{$borrow->id}",
                ['fine_id' => $fine->id, 'amount' => $fine->amount],
                null,
                $fine
            );

            $fine->load('fineType', 'borrow.user', 'borrow.borrowDetails.bookCopy.book');

            event(new \App\Events\FineCreated($fine));

            return $fine;
        });
    }
}
