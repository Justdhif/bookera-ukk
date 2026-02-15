<?php

namespace App\Services\LostBook;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Fine;
use App\Models\FineType;
use App\Models\Loan;
use App\Models\LostBook;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class LostBookService
{
    public function getAllLostBooks(?string $search = null): Collection
    {
        $query = LostBook::with([
            'loan.user.profile',
            'loan.fines.fineType',
            'bookCopy.book',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('loan_id', 'like', "%{$search}%")
                    ->orWhereHas('loan.user', function ($userQuery) use ($search) {
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

    public function reportLostBook(Loan $loan, array $data): LostBook
    {
        return DB::transaction(function () use ($loan, $data) {
            $lostBook = LostBook::create([
                'loan_id' => $loan->id,
                'book_copy_id' => $data['book_copy_id'],
                'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $bookCopy = BookCopy::find($data['book_copy_id']);
            $oldStatus = $bookCopy->status;

            $bookCopy->update(['status' => 'lost']);

            ActivityLogger::log(
                'update',
                'book_copy',
                "Book copy #{$bookCopy->id} ({$bookCopy->book->title}) reported as lost",
                [
                    'copy_id' => $bookCopy->id,
                    'new_status' => 'lost',
                    'loan_id' => $loan->id,
                ],
                [
                    'copy_id' => $bookCopy->id,
                    'old_status' => $oldStatus,
                ],
                $bookCopy
            );

            $oldLoanStatus = $loan->status;
            $loan->update(['status' => 'checking']);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} status changed to 'checking' - lost book reported, awaiting admin verification",
                ['loan_id' => $loan->id, 'new_status' => 'checking'],
                ['loan_id' => $loan->id, 'old_status' => $oldLoanStatus],
                $loan
            );

            ActivityLogger::log(
                'create',
                'lost_book',
                "Lost book reported for loan #{$loan->id}",
                [
                    'lost_book_id' => $lostBook->id,
                    'loan_id' => $loan->id,
                    'book_copy_id' => $data['book_copy_id'],
                    'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                ],
                null,
                $lostBook
            );

            $lostBook->load(['loan.user.profile', 'bookCopy.book']);

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

        return $lostBook->load(['loan.user.profile', 'bookCopy.book']);
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
                'loan_id' => $lostBook->loan_id,
                'book_copy_id' => $lostBook->book_copy_id,
            ],
            null,
            $lostBook
        );

        $lostBook->delete();

        if ($lostBook->loan->status === 'borrowed') {
            $bookCopy->update(['status' => 'borrowed']);
        }
    }

    public function finishLostBookProcess(LostBook $lostBook): LostBook
    {
        $loan = $lostBook->loan;

        DB::transaction(function () use ($loan, $lostBook) {
            $oldStatus = $loan->status;

            $loan->update(['status' => 'lost']);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} marked as lost (finished lost book process)",
                [
                    'loan_id' => $loan->id,
                    'new_status' => 'lost',
                    'lost_book_id' => $lostBook->id,
                ],
                [
                    'loan_id' => $loan->id,
                    'old_status' => $oldStatus,
                ],
                $loan
            );
        });

        return $lostBook->load(['loan.user.profile', 'bookCopy.book']);
    }

    public function canReportLost(Loan $loan, int $bookCopyId): array
    {
        if ($loan->status !== 'borrowed') {
            return [false, 'Peminjaman ini tidak dalam status dipinjam'];
        }

        $loanDetail = $loan->details()->where('book_copy_id', $bookCopyId)->first();

        if (!$loanDetail) {
            return [false, 'Buku ini tidak termasuk dalam peminjaman'];
        }

        $existingLostBook = LostBook::where('loan_id', $loan->id)
            ->where('book_copy_id', $bookCopyId)
            ->first();

        if ($existingLostBook) {
            return [false, 'Buku ini sudah dilaporkan hilang'];
        }

        return [true, ''];
    }

    public function canFinish(LostBook $lostBook): array
    {
        $loan = $lostBook->loan;

        $unpaidFines = $loan->fines()->where('status', 'unpaid')->count();
        if ($unpaidFines > 0) {
            return [false, 'Tidak dapat menyelesaikan proses buku hilang. Masih ada denda yang belum dibayar.'];
        }

        return [true, ''];
    }

    public function processFine(LostBook $lostBook): Fine
    {
        return DB::transaction(function () use ($lostBook) {
            $loan = $lostBook->loan;
            $bookCopy = $lostBook->bookCopy;

            $existingFine = $loan->fines()
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
                'loan_id' => $loan->id,
                'fine_type_id' => $lostFineType->id,
                'amount' => $lostFineType->amount,
                'status' => 'unpaid',
                'notes' => 'Denda buku hilang: ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')',
            ]);

            ActivityLogger::log(
                'create',
                'fine',
                "Fine created for lost book in loan #{$loan->id}",
                ['fine_id' => $fine->id, 'amount' => $fine->amount],
                null,
                $fine
            );

            $fine->load('fineType', 'loan.user', 'loan.details.bookCopy.book');

            event(new \App\Events\FineCreated($fine));

            return $fine;
        });
    }
}
