<?php

namespace App\Services\Approval;

use App\Events\LoanApproved;
use App\Events\LoanRejected;
use App\Helpers\ActivityLogger;
use App\Models\BookReturn;
use App\Models\Loan;
use App\Models\LoanDetail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    public function approveLoanDetail(LoanDetail $loanDetail): LoanDetail
    {
        if ($loanDetail->approval_status !== 'pending') {
            throw new \Exception('Salinan buku ini sudah diproses sebelumnya');
        }

        return DB::transaction(function () use ($loanDetail) {
            $loanDetail->update([
                'approval_status' => 'approved',
            ]);

            $loan = $loanDetail->loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

            $approvalStatus = $loan->approval_status;

            if ($approvalStatus === 'approved') {
                $loan->update(['status' => 'waiting']);
            }

            ActivityLogger::log(
                'update',
                'loan_detail',
                "Loan detail #{$loanDetail->id} approved by admin",
                [
                    'loan_detail_id' => $loanDetail->id,
                    'loan_id' => $loanDetail->loan_id,
                    'approval_status' => 'approved',
                    'overall_status' => $approvalStatus,
                ],
                [
                    'loan_detail_id' => $loanDetail->id,
                    'old_approval_status' => 'pending',
                ],
                $loanDetail
            );

            if (in_array($approvalStatus, ['approved', 'rejected', 'partial'])) {
                event(new LoanApproved($loan));
            }

            return $loanDetail->fresh();
        });
    }

    public function rejectLoanDetail(LoanDetail $loanDetail, ?string $note = null): LoanDetail
    {
        if ($loanDetail->approval_status !== 'pending') {
            throw new \Exception('Salinan buku ini sudah diproses sebelumnya');
        }

        return DB::transaction(function () use ($loanDetail, $note) {
            $loanDetail->update([
                'approval_status' => 'rejected',
                'note' => $note,
            ]);

            $loan = $loanDetail->loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

            $approvalStatus = $loan->approval_status;

            if ($approvalStatus === 'rejected') {
                $loan->update(['status' => 'rejected']);
            }

            ActivityLogger::log(
                'update',
                'loan_detail',
                "Loan detail #{$loanDetail->id} rejected by admin",
                [
                    'loan_detail_id' => $loanDetail->id,
                    'loan_id' => $loanDetail->loan_id,
                    'approval_status' => 'rejected',
                    'note' => $note ?? 'No reason provided',
                    'overall_status' => $approvalStatus,
                ],
                null,
                $loanDetail
            );

            if (in_array($approvalStatus, ['approved', 'rejected', 'partial'])) {
                event(new LoanRejected($loan, $note));
            }

            return $loanDetail->fresh();
        });
    }

    public function approveLoan(Loan $loan): Loan
    {
        return DB::transaction(function () use ($loan) {
            $oldStatus = $loan->status;

            foreach ($loan->loanDetails as $detail) {
                if ($detail->approval_status === 'pending') {
                    $detail->update(['approval_status' => 'approved']);
                }
            }

            $loan->update(['status' => 'waiting']);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} fully approved by admin - waiting for book handover",
                [
                    'loan_id' => $loan->id,
                    'status' => 'waiting',
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

            event(new LoanApproved($loan));

            return $loan;
        });
    }

    public function rejectLoan(Loan $loan, ?string $rejectionReason = null): Loan
    {
        return DB::transaction(function () use ($loan, $rejectionReason) {
            foreach ($loan->loanDetails as $detail) {
                if ($detail->approval_status === 'pending') {
                    $detail->update([
                        'approval_status' => 'rejected',
                        'note' => $rejectionReason,
                    ]);
                }
            }

            $loan->update(['status' => 'rejected']);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} fully rejected by admin",
                [
                    'loan_id' => $loan->id,
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
        });
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
                if ($detail->approval_status === 'approved') {
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

    public function getPendingLoans(?string $search = null): Collection
    {
        $query = Loan::with([
            'loanDetails.bookCopy.book',
            'user.profile'
        ])
            ->whereHas('loanDetails', function ($q) {
                $q->where('approval_status', 'pending');
            })
            ->where('status', '!=', 'rejected');

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

    public function getApprovedLoans(?string $search = null): Collection
    {
        $query = Loan::with([
            'loanDetails.bookCopy.book',
            'user.profile'
        ])
            ->where('status', 'waiting')
            ->whereHas('loanDetails', function ($q) {
                $q->where('approval_status', 'approved');
            });

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
