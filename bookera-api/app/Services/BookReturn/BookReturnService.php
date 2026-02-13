<?php

namespace App\Services\BookReturn;

use App\Helpers\ActivityLogger;
use App\Models\BookReturn;
use App\Models\Fine;
use App\Models\FineType;
use App\Models\Loan;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BookReturnService
{
    public function getReturnsByLoan(Loan $loan): Collection
    {
        return BookReturn::with(['details.bookCopy.book'])
            ->where('loan_id', $loan->id)
            ->latest()
            ->get();
    }

    public function createReturn(Loan $loan, array $data): BookReturn
    {
        return DB::transaction(function () use ($loan, $data) {
            $return = BookReturn::create([
                'loan_id' => $loan->id,
                'return_date' => now(),
            ]);

            $returnedCopies = [];
            $hasDamagedBooks = false;

            foreach ($data['copies'] as $copy) {
                $return->details()->create([
                    'book_copy_id' => $copy['book_copy_id'],
                    'condition' => $copy['condition'],
                ]);

                $loanDetail = $loan->details()
                    ->where('book_copy_id', $copy['book_copy_id'])
                    ->firstOrFail();

                $bookCopy = $loanDetail->bookCopy;

                if ($copy['condition'] === 'damaged') {
                    $hasDamagedBooks = true;
                }

                $returnedCopies[] = [
                    'copy_id' => $bookCopy->id,
                    'book_title' => $bookCopy->book->title ?? 'Unknown',
                    'condition' => $copy['condition'],
                ];

                ActivityLogger::log(
                    'create',
                    'book_return_detail',
                    "Return requested for book copy #{$bookCopy->id} ({$bookCopy->book->title}) with condition '{$copy['condition']}'",
                    ['copy_id' => $bookCopy->id, 'condition' => $copy['condition']],
                    null,
                    $bookCopy
                );
            }

            $oldLoanStatus = $loan->status;
            $loan->update(['status' => 'checking']);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} status changed to 'checking' - awaiting admin approval",
                ['loan_id' => $loan->id, 'new_status' => 'checking'],
                ['loan_id' => $loan->id, 'old_status' => $oldLoanStatus],
                $loan
            );

            if ($hasDamagedBooks) {
                $damagedFineType = FineType::where('type', 'damaged')->first();

                if ($damagedFineType) {
                    $fine = Fine::create([
                        'loan_id' => $loan->id,
                        'fine_type_id' => $damagedFineType->id,
                        'amount' => $damagedFineType->amount,
                        'status' => 'unpaid',
                    ]);

                    ActivityLogger::log(
                        'create',
                        'fine',
                        "Auto-created damaged book fine for loan #{$loan->id}",
                        ['fine_id' => $fine->id, 'amount' => $fine->amount],
                        null,
                        $fine
                    );
                }
            }

            $return->load(['details.bookCopy.book']);

            ActivityLogger::log(
                'create',
                'book_return',
                "Return requested for loan #{$loan->id} with " . count($returnedCopies) . " book(s)",
                [
                    'return_id' => $return->id,
                    'loan_id' => $loan->id,
                    'return_date' => $return->return_date,
                    'returned_copies' => $returnedCopies,
                ],
                null,
                $return
            );

            return $return;
        });
    }

    public function approveReturn(BookReturn $bookReturn): BookReturn
    {
        $loan = $bookReturn->loan;

        DB::transaction(function () use ($loan, $bookReturn) {
            foreach ($bookReturn->details as $detail) {
                $bookCopy = $detail->bookCopy;
                $oldStatus = $bookCopy->status;

                $newStatus = match($detail->condition) {
                    'good' => 'available',
                    'damaged' => 'damaged',
                    'lost' => 'lost',
                    default => 'available'
                };

                $bookCopy->update(['status' => $newStatus]);

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$bookCopy->id} status changed to '{$newStatus}' (condition: {$detail->condition})",
                    ['copy_id' => $bookCopy->id, 'new_status' => $newStatus, 'condition' => $detail->condition],
                    ['copy_id' => $bookCopy->id, 'old_status' => $oldStatus],
                    $bookCopy
                );
            }

            $oldLoanStatus = $loan->status;
            $loan->update(['status' => 'returned']);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} finished - status changed to 'returned'",
                ['loan_id' => $loan->id, 'new_status' => 'returned'],
                ['loan_id' => $loan->id, 'old_status' => $oldLoanStatus],
                $loan
            );
        });

        return $bookReturn->load('details.bookCopy.book', 'loan');
    }

    public function canCreateReturn(Loan $loan): bool
    {
        return $loan->status === 'borrowed';
    }

    public function canApproveReturn(BookReturn $bookReturn): bool
    {
        $loan = $bookReturn->loan;

        if ($loan->status !== 'checking') {
            return false;
        }

        $hasDamagedOrLostBooks = $bookReturn->details()
            ->whereIn('condition', ['damaged', 'lost'])
            ->exists();

        if ($hasDamagedOrLostBooks) {
            $unpaidFines = $loan->fines()->where('status', 'unpaid')->exists();

            if ($unpaidFines) {
                return false;
            }
        }

        return true;
    }
}
