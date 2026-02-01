<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\Loan;
use App\Models\BookReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookReturnController extends Controller
{
    public function index(Loan $loan)
    {
        $returns = BookReturn::with([
            'details.bookCopy.book',
        ])
            ->where('loan_id', $loan->id)
            ->latest()
            ->get();

        return ApiResponse::successResponse(
            'Data pengembalian buku berhasil diambil',
            $returns
        );
    }

    public function store(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'copies' => 'required|array',
            'copies.*.book_copy_id' => 'required|integer|exists:book_copies,id',
            'copies.*.condition' => 'nullable|string|in:good,damaged,lost',
        ]);

        $bookReturn = DB::transaction(function () use ($loan, $data) {

            $oldLoanStatus = $loan->status;

            $return = BookReturn::create([
                'loan_id' => $loan->id,
                'return_date' => now(),
            ]);

            $returnedCopies = [];

            foreach ($data['copies'] as $copy) {

                $return->details()->create([
                    'book_copy_id' => $copy['book_copy_id'],
                    'condition' => $copy['condition'] ?? 'good',
                ]);

                $loanDetail = $loan->details()
                    ->where('book_copy_id', $copy['book_copy_id'])
                    ->firstOrFail();

                $bookCopy = $loanDetail->bookCopy;
                $oldCopyStatus = $bookCopy->status;

                $newStatus = ($copy['condition'] ?? 'good') === 'lost'
                    ? 'lost'
                    : 'available';

                $bookCopy->update([
                    'status' => $newStatus,
                ]);

                $returnedCopies[] = [
                    'copy_id' => $bookCopy->id,
                    'book_title' => $bookCopy->book->title ?? 'Unknown',
                    'old_status' => $oldCopyStatus,
                    'new_status' => $newStatus,
                    'condition' => $copy['condition'] ?? 'good',
                ];
            }

            $loan->update([
                'status' => 'returned',
            ]);

            $return->load([
                'details.bookCopy.book',
            ]);

            ActivityLogger::log(
                'create',
                'book_return',
                "Processed return for loan #{$loan->id} with " . count($returnedCopies) . " book(s)",
                [
                    'return_id' => $return->id,
                    'loan_id' => $loan->id,
                    'return_date' => $return->return_date,
                    'returned_copies' => $returnedCopies,
                ]
            );

            foreach ($returnedCopies as $copInfo) {
                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copInfo['copy_id']} ({$copInfo['book_title']}) returned with condition '{$copInfo['condition']}' - status changed to {$copInfo['new_status']}",
                    ['copy_id' => $copInfo['copy_id'], 'new_status' => $copInfo['new_status'], 'condition' => $copInfo['condition']],
                    ['copy_id' => $copInfo['copy_id'], 'old_status' => $copInfo['old_status']]
                );
            }

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} status changed from {$oldLoanStatus} to returned",
                ['loan_id' => $loan->id, 'new_status' => 'returned'],
                ['loan_id' => $loan->id, 'old_status' => $oldLoanStatus]
            );

            return $return;
        });

        return ApiResponse::successResponse(
            'Pengembalian buku berhasil diproses',
            $bookReturn,
            201
        );
    }

    public function show(BookReturn $bookReturn)
    {
        return ApiResponse::successResponse(
            'Detail pengembalian buku',
            $bookReturn
        );
    }
}
