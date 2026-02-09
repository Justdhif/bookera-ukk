<?php

namespace App\Http\Controllers\Api;

use App\Events\LoanApproved;
use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\Loan;
use App\Models\BookCopy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * LOAN APPROVAL FLOW:
 *
 * 1. User Request Loan:
 *    - status: 'pending'
 *    - approval_status: 'pending'
 *    - Book status: 'available' (tidak berubah)
 *
 * 2. Admin Approve (approveLoan):
 *    - approval_status: 'approved'
 *    - status: 'waiting'
 *    - Book status: masih 'available'
 *
 * 3. Admin Mark as Borrowed (markAsBorrowed):
 *    - status: 'borrowed'
 *    - Book status: 'borrowed'
 *
 * 4. Admin Reject (rejectLoan):
 *    - approval_status: 'rejected'
 *    - status: 'rejected'
 *    - Book status: tetap 'available'
 */
class ApprovalController extends Controller
{
    /**
     * Approve loan request
     * Status akan berubah dari 'pending' ke 'waiting'
     */
    public function approveLoan(Request $request, Loan $loan)
    {
        if ($loan->approval_status !== 'pending') {
            return ApiResponse::errorResponse(
                'Peminjaman ini sudah diproses sebelumnya',
                null,
                400
            );
        }

        $loan = DB::transaction(function () use ($loan) {
            $oldStatus = $loan->status;

            // Update approval status dan loan status ke waiting
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

            return $loan;
        });

        event(new LoanApproved($loan));

        return ApiResponse::successResponse(
            'Peminjaman berhasil disetujui',
            $loan
        );
    }

    /**
     * Reject loan request
     */
    public function rejectLoan(Request $request, Loan $loan)
    {
        if ($loan->approval_status !== 'pending') {
            return ApiResponse::errorResponse(
                'Peminjaman ini sudah diproses sebelumnya',
                null,
                400
            );
        }

        $data = $request->validate([
            'rejection_reason' => 'nullable|string',
        ]);

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
                'reason' => $data['rejection_reason'] ?? 'No reason provided',
            ],
            null,
            $loan
        );

        $loan->load([
            'loanDetails.bookCopy.book',
            'user',
        ]);

        return ApiResponse::successResponse(
            'Peminjaman ditolak',
            $loan
        );
    }

    /**
     * Mark loan as borrowed (setelah approved, admin serahkan buku)
     */
    public function markAsBorrowed(Request $request, Loan $loan)
    {
        if ($loan->approval_status !== 'approved') {
            return ApiResponse::errorResponse(
                'Peminjaman harus di-approve terlebih dahulu',
                null,
                400
            );
        }

        if ($loan->status === 'borrowed') {
            return ApiResponse::errorResponse(
                'Peminjaman ini sudah berstatus borrowed',
                null,
                400
            );
        }

        $loan = DB::transaction(function () use ($loan) {
            $oldStatus = $loan->status;

            // Update loan status to borrowed
            $loan->update([
                'status' => 'borrowed',
            ]);

            // Update book copies status to borrowed
            $borrowedCopies = [];
            foreach ($loan->loanDetails as $detail) {
                $copy = $detail->bookCopy;
                $oldCopyStatus = $copy->status;

                $copy->update([
                    'status' => 'borrowed',
                ]);

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

        return ApiResponse::successResponse(
            'Status peminjaman berhasil diubah menjadi borrowed',
            $loan
        );
    }

    /**
     * Get all approved loans (waiting to be marked as borrowed)
     */
    public function getApprovedLoans(Request $request)
    {
        $query = Loan::with([
            'loanDetails.bookCopy.book',
            'user.profile'
        ])
            ->where('approval_status', 'approved')
            ->where('status', 'waiting');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
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

        $loans = $query->latest()->get();

        return ApiResponse::successResponse(
            'Data peminjaman yang sudah di-approve dan menunggu penyerahan buku',
            $loans
        );
    }

    /**
     * Get all book returns (all approval statuses)
     */
    public function getAllReturns(Request $request)
    {
        $query = BookReturn::with([
            'loan.user.profile',
            'loan.loanDetails.bookCopy.book',
            'details.bookCopy.book',
        ]);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
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

        $returns = $query->latest()->get();

        return ApiResponse::successResponse(
            'Data semua pengembalian buku',
            $returns
        );
    }
}
