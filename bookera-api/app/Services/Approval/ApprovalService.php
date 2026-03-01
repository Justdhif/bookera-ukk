<?php

namespace App\Services\Approval;

use App\Events\BorrowApproved;
use App\Events\BorrowRejected;
use App\Helpers\ActivityLogger;
use App\Models\BookReturn;
use App\Models\Borrow;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    public function approveBorrow(Borrow $borrow): Borrow
    {
        return DB::transaction(function () use ($borrow) {
            $oldStatus = $borrow->status;

            $borrow->update(['approval_status' => 'approved']);

            ActivityLogger::log(
                'update',
                'borrow',
                "Borrow #{$borrow->id} fully approved by admin - waiting for book handover",
                [
                    'borrow_id'  => $borrow->id,
                    'status'     => 'open',
                ],
                [
                    'borrow_id'  => $borrow->id,
                    'old_status' => $oldStatus,
                ],
                $borrow
            );

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'user',
            ]);

            event(new BorrowApproved($borrow));

            return $borrow;
        });
    }

    public function rejectBorrow(Borrow $borrow, ?string $rejectionReason = null): Borrow
    {
        return DB::transaction(function () use ($borrow, $rejectionReason) {
            $borrow->update([
                'approval_status' => 'rejected',
                'status'          => 'close',
            ]);

            ActivityLogger::log(
                'update',
                'borrow',
                "Borrow #{$borrow->id} fully rejected by admin",
                [
                    'borrow_id' => $borrow->id,
                    'status'    => 'close',
                    'reason'    => $rejectionReason ?? 'No reason provided',
                ],
                null,
                $borrow
            );

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'user',
            ]);

            event(new BorrowRejected($borrow, $rejectionReason));

            return $borrow;
        });
    }

    public function markBorrowAsOpen(Borrow $borrow): Borrow
    {
        if ($borrow->approval_status !== 'approved') {
            throw new \Exception('Peminjaman harus di-approve terlebih dahulu');
        }

        return DB::transaction(function () use ($borrow) {
            $oldStatus = $borrow->status;

            $borrowedCopies = [];
            foreach ($borrow->borrowDetails as $detail) {
                $copy = $detail->bookCopy;
                $oldCopyStatus = $copy->status;

                $copy->update(['status' => 'borrowed']);
                $detail->update(['status' => 'borrowed']);

                $borrowedCopies[] = [
                    'copy_id'    => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                    'old_status' => $oldCopyStatus,
                ];

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copy->id} ({$copy->book->title}) status changed to borrowed (borrow #{$borrow->id} handed over)",
                    ['copy_id' => $copy->id, 'new_status' => 'borrowed', 'borrow_id' => $borrow->id],
                    ['copy_id' => $copy->id, 'old_status' => $oldCopyStatus],
                    $copy
                );
            }

            ActivityLogger::log(
                'update',
                'borrow',
                "Borrow #{$borrow->id} opened - books handed over to user",
                [
                    'borrow_id'       => $borrow->id,
                    'new_status'      => 'open',
                    'borrowed_copies' => $borrowedCopies,
                ],
                [
                    'borrow_id'  => $borrow->id,
                    'old_status' => $oldStatus,
                ],
                $borrow
            );

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'user',
            ]);

            return $borrow;
        });
    }

    public function getPendingBorrows(?string $search = null): Collection
    {
        $query = Borrow::with([
            'borrowDetails.bookCopy.book',
            'user.profile',
        ])
            ->where('approval_status', 'pending')
            ->where('status', 'open');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('borrowDetails.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function getApprovedBorrows(?string $search = null): Collection
    {
        $query = Borrow::with([
            'borrowDetails.bookCopy.book',
            'user.profile',
        ])
            ->where('status', 'open')
            ->where('approval_status', 'approved');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('borrowDetails.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function getAllReturns(?string $search = null): Collection
    {
        $query = BookReturn::with([
            'borrow.user.profile',
            'borrow.borrowDetails.bookCopy.book',
            'details.bookCopy.book',
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
                    ->orWhereHas('details.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }
}
