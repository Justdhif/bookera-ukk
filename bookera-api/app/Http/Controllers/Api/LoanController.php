<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\Loan;
use App\Models\BookCopy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::with([
            'loanDetails.bookCopy.book',
            'user.profile'
        ]);

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
            'Data peminjaman berhasil diambil',
            $loans
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'book_copy_ids' => 'required|array|min:1',
            'book_copy_ids.*' => 'required|integer|exists:book_copies,id',
            'due_date' => 'required|date|after_or_equal:today',
        ]);

        $loan = DB::transaction(function () use ($data, $request) {

            $loan = Loan::create([
                'user_id' => $request->user()->id,
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

                // Status buku tidak diubah dulu, menunggu approval
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

            return $loan;
        });

        return ApiResponse::successResponse(
            'Permintaan peminjaman berhasil dibuat dan menunggu persetujuan admin',
            $loan,
            201
        );
    }

    /**
     * Admin creates loan directly at library (auto approved & borrowed)
     */
    public function storeAdminLoan(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'book_copy_ids' => 'required|array|min:1',
            'book_copy_ids.*' => 'required|integer|exists:book_copies,id',
            'due_date' => 'required|date|after_or_equal:today',
        ]);

        $loan = DB::transaction(function () use ($data, $request) {

            $loan = Loan::create([
                'user_id' => $data['user_id'],
                'loan_date' => now(),
                'due_date' => $data['due_date'],
                'status' => 'borrowed', // Auto borrowed
                'approval_status' => 'approved', // Auto approved
                'approved_by' => $request->user()->id,
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

                // Update book copy status to borrowed immediately
                $copy->update([
                    'status' => 'borrowed',
                ]);

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
                    'admin' => $request->user()->email,
                ],
                null,
                $loan
            );

            return $loan;
        });

        return ApiResponse::successResponse(
            'Peminjaman langsung berhasil dibuat dengan status approved & borrowed',
            $loan,
            201
        );
    }

    public function show(Loan $loan)
    {
        $loan->load([
            'loanDetails.bookCopy.book',
            'user',
        ]);

        return ApiResponse::successResponse(
            'Detail peminjaman',
            $loan
        );
    }

    public function update(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'book_copy_ids' => 'array|min:1',
            'book_copy_ids.*' => 'integer|exists:book_copies,id',
            'due_date' => 'date|after_or_equal:today',
        ]);

        $loan = DB::transaction(function () use ($loan, $data) {

            $oldDueDate = $loan->due_date;

            $loan->update([
                'due_date' => $data['due_date'],
            ]);

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

                $copy->update([
                    'status' => 'borrowed',
                ]);
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

            foreach ($addedCopies as $copInfo) {
                $copy = BookCopy::find($copInfo['copy_id']);
                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copInfo['copy_id']} ({$copInfo['book_title']}) status changed to borrowed (added to loan #{$loan->id})",
                    ['copy_id' => $copInfo['copy_id'], 'new_status' => 'borrowed', 'loan_id' => $loan->id],
                    ['copy_id' => $copInfo['copy_id'], 'old_status' => 'available'],
                    $copy
                );
            }

            return $loan;
        });

        return ApiResponse::successResponse(
            'Peminjaman berhasil diupdate',
            $loan
        );
    }

    public function getLoanByUser(Request $request)
    {
        $user = $request->user();

        $loans = Loan::with([
            'loanDetails.bookCopy.book',
            'bookReturns' => function ($query) {
                $query->where('approval_status', 'pending');
            },
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return ApiResponse::successResponse(
            'Data peminjaman user',
            $loans
        );
    }
}
