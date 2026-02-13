<?php

namespace App\Services\Approval;

use App\Events\LoanApproved;
use App\Events\LoanRejected;
use App\Helpers\ActivityLogger;
use App\Models\BookReturn;
use App\Models\Loan;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    public function approveLoan(Loan $loan): Loan
    {
        if ($loan->approval_status !== 'pending') {
            throw new \Exception('Peminjaman ini sudah diproses sebelumnya');
        }

        return DB::transaction(function () use ($loan) {
            $oldStatus = $loan->status;

            $loan->update([
                'approval_status' => 'approved',
                'status' => 'waiting',
            ]);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} approved by admin - waiting for book handover",
                [
                    'loan_id' => $loan->id,
                    'approval_status' => 'approved',
                    'status' => 'waiting',
                ],
                [
                    'loan_id' => $loan->id,
                    'old_status' => $oldStatus,
                    'old_approval_status' => 'pending',
                ],
                $loan
            );

            $loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

            event(new LoanApproved($loan));

            return $loan;
        });
    }

    public function rejectLoan(Loan $loan, ?string $rejectionReason = null): Loan
    {
        if ($loan->approval_status !== 'pending') {
            throw new \Exception('Peminjaman ini sudah diproses sebelumnya');
        }

        $loan->update([
            'approval_status' => 'rejected',
            'status' => 'rejected',
        ]);

        ActivityLogger::log(
            'update',
            'loan',
            "Loan #{$loan->id} rejected by admin",
            [
                'loan_id' => $loan->id,
                'approval_status' => 'rejected',
                'status' => 'rejected',
                'reason' => $rejectionReason ?? 'No reason provided',
            ],
            null,
            $loan
        );

        $loan->load([
            'loanDetails.bookCopy.book',
            'user',
        ]);

        event(new LoanRejected($loan, $rejectionReason));

        return $loan;
    }

    public function markLoanAsBorrowed(Loan $loan): Loan
    {
        if ($loan->approval_status !== 'approved') {
            throw new \Exception('Peminjaman harus di-approve terlebih dahulu');
        }

        if ($loan->status === 'borrowed') {
            throw new \Exception('Peminjaman ini sudah berstatus borrowed');
        }

        return DB::transaction(function () use ($loan) {
            $oldStatus = $loan->status;

            $loan->update(['status' => 'borrowed']);

            $borrowedCopies = [];
            foreach ($loan->loanDetails as $detail) {
                $copy = $detail->bookCopy;
                $oldCopyStatus = $copy->status;

                $copy->update(['status' => 'borrowed']);

                $borrowedCopies[] = [
                    'copy_id' => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                    'old_status' => $oldCopyStatus,
                ];

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copy->id} ({$copy->book->title}) status changed to borrowed (loan #{$loan->id} handed over)",
                    ['copy_id' => $copy->id, 'new_status' => 'borrowed', 'loan_id' => $loan->id],
                    ['copy_id' => $copy->id, 'old_status' => $oldCopyStatus],
                    $copy
                );
            }

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} marked as borrowed - books handed over to user",
                [
                    'loan_id' => $loan->id,
                    'new_status' => 'borrowed',
                    'borrowed_copies' => $borrowedCopies,
                ],
                [
                    'loan_id' => $loan->id,
                    'old_status' => $oldStatus,
                ],
                $loan
            );

            $loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

            return $loan;
        });
    }

    public function getApprovedLoans(?string $search = null): Collection
    {
        $query = Loan::with([
            'loanDetails.bookCopy.book',
            'user.profile'
        ])
            ->where('approval_status', 'approved')
            ->where('status', 'waiting');

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

    public function getAllReturns(?string $search = null): Collection
    {
        $query = BookReturn::with([
            'loan.user.profile',
            'loan.loanDetails.bookCopy.book',
            'details.bookCopy.book',
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
                    ->orWhereHas('details.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }
}
