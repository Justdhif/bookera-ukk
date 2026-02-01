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
    public function index()
    {
        $loans = Loan::with([
            'loanDetails.bookCopy.book',
            'user'
        ])
            ->latest()
            ->get();

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
                'status' => 'borrowed',
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

                $copy->update([
                    'status' => 'borrowed',
                ]);
            }

            $loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

            ActivityLogger::log(
                'create',
                'loan',
                "Created loan #{$loan->id} for user {$loan->user->email} with " . count($borrowedCopies) . " book(s)",
                [
                    'loan_id' => $loan->id,
                    'user' => $loan->user->email,
                    'due_date' => $loan->due_date,
                    'borrowed_copies' => $borrowedCopies,
                ]
            );

            foreach ($borrowedCopies as $copInfo) {
                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copInfo['copy_id']} ({$copInfo['book_title']}) status changed from {$copInfo['old_status']} to borrowed",
                    ['copy_id' => $copInfo['copy_id'], 'new_status' => 'borrowed'],
                    ['copy_id' => $copInfo['copy_id'], 'old_status' => $copInfo['old_status']]
                );
            }

            return $loan;
        });

        return ApiResponse::successResponse(
            'Peminjaman berhasil dibuat',
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
                ]
            );

            foreach ($addedCopies as $copInfo) {
                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copInfo['copy_id']} ({$copInfo['book_title']}) status changed to borrowed (added to loan #{$loan->id})",
                    ['copy_id' => $copInfo['copy_id'], 'new_status' => 'borrowed', 'loan_id' => $loan->id],
                    ['copy_id' => $copInfo['copy_id'], 'old_status' => 'available']
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
