<?php

namespace App\Services\Loan;

use App\Events\LoanRequested;
use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class LoanService
{
    public function getLoans(?string $search = null): Collection
    {
        $query = Loan::with([
            'loanDetails.bookCopy.book',
            'user.profile',
            'bookReturns.details.bookCopy.book',
            'fines.fineType',
            'lostBooks.bookCopy.book'
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('loanDetails.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function createLoan(array $data, User $user): Loan
    {
        return DB::transaction(function () use ($data, $user) {
            $loan = Loan::create([
                'user_id' => $user->id,
                'loan_date' => now(),
                'due_date' => $data['due_date'],
                'status' => 'pending',
                'approval_status' => 'pending',
            ]);

            $borrowedCopies = [];

            foreach ($data['book_copy_ids'] as $copyId) {
                $copy = BookCopy::where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $loan->loanDetails()->create([
                    'book_copy_id' => $copy->id,
                ]);

                $borrowedCopies[] = [
                    'copy_id' => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                    'old_status' => $copy->status,
                ];
            }

            $loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

            ActivityLogger::log(
                'create',
                'loan',
                "Created loan request #{$loan->id} for user {$loan->user->email} with " . count($borrowedCopies) . " book(s) - Waiting for approval",
                [
                    'loan_id' => $loan->id,
                    'user' => $loan->user->email,
                    'due_date' => $loan->due_date,
                    'approval_status' => 'pending',
                    'borrowed_copies' => $borrowedCopies,
                ],
                null,
                $loan
            );

            event(new LoanRequested($loan));

            return $loan;
        });
    }

    public function createAdminLoan(array $data, User $admin): Loan
    {
        return DB::transaction(function () use ($data, $admin) {
            $loan = Loan::create([
                'user_id' => $data['user_id'],
                'loan_date' => now(),
                'due_date' => $data['due_date'],
                'status' => 'borrowed',
                'approval_status' => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
            ]);

            $borrowedCopies = [];

            foreach ($data['book_copy_ids'] as $copyId) {
                $copy = BookCopy::where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $loan->loanDetails()->create([
                    'book_copy_id' => $copy->id,
                ]);

                $borrowedCopies[] = [
                    'copy_id' => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                    'old_status' => $copy->status,
                ];

                $copy->update(['status' => 'borrowed']);

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copy->id} ({$copy->book->title}) status changed to borrowed (admin loan #{$loan->id})",
                    ['copy_id' => $copy->id, 'new_status' => 'borrowed', 'loan_id' => $loan->id],
                    ['copy_id' => $copy->id, 'old_status' => 'available'],
                    $copy
                );
            }

            $loan->load([
                'loanDetails.bookCopy.book',
                'user.profile',
            ]);

            ActivityLogger::log(
                'create',
                'loan',
                "Admin created direct loan #{$loan->id} for user {$loan->user->email} with " . count($borrowedCopies) . " book(s) - Auto approved & borrowed",
                [
                    'loan_id' => $loan->id,
                    'user' => $loan->user->email,
                    'due_date' => $loan->due_date,
                    'approval_status' => 'approved',
                    'status' => 'borrowed',
                    'borrowed_copies' => $borrowedCopies,
                    'admin' => $admin->email,
                ],
                null,
                $loan
            );

            return $loan;
        });
    }

    public function getLoanById(Loan $loan): Loan
    {
        return $loan->load([
            'loanDetails.bookCopy.book',
            'user',
        ]);
    }

    public function updateLoan(Loan $loan, array $data): Loan
    {
        return DB::transaction(function () use ($loan, $data) {
            $oldDueDate = $loan->due_date;

            $loan->update(['due_date' => $data['due_date']]);

            $addedCopies = [];

            foreach ($data['book_copy_ids'] as $copyId) {
                $copy = BookCopy::where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $loan->loanDetails()->create([
                    'book_copy_id' => $copy->id,
                ]);

                $addedCopies[] = [
                    'copy_id' => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                ];

                $copy->update(['status' => 'borrowed']);
            }

            $loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

            ActivityLogger::log(
                'update',
                'loan',
                "Updated loan #{$loan->id} - added " . count($addedCopies) . " book(s)",
                [
                    'loan_id' => $loan->id,
                    'new_due_date' => $loan->due_date,
                    'added_copies' => $addedCopies,
                ],
                [
                    'loan_id' => $loan->id,
                    'old_due_date' => $oldDueDate,
                ],
                $loan
            );

            foreach ($addedCopies as $copyInfo) {
                $copy = BookCopy::find($copyInfo['copy_id']);
                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copyInfo['copy_id']} ({$copyInfo['book_title']}) status changed to borrowed (added to loan #{$loan->id})",
                    ['copy_id' => $copyInfo['copy_id'], 'new_status' => 'borrowed', 'loan_id' => $loan->id],
                    ['copy_id' => $copyInfo['copy_id'], 'old_status' => 'available'],
                    $copy
                );
            }

            return $loan;
        });
    }

    public function getLoansByUser(User $user): Collection
    {
        return Loan::with([
            'loanDetails.bookCopy.book',
            'bookReturns.details',
            'fines.fineType',
            'lostBooks.bookCopy.book'
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }
}
