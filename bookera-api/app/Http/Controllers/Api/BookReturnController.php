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
                'approval_status' => 'pending',
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
                    : $oldCopyStatus; // Tidak ubah status dulu, menunggu approval

                $returnedCopies[] = [
                    'copy_id' => $bookCopy->id,
                    'book_title' => $bookCopy->book->title ?? 'Unknown',
                    'old_status' => $oldCopyStatus,
                    'condition' => $copy['condition'] ?? 'good',
                ];
            }

            // Status loan tidak diubah dulu, menunggu approval

            $return->load([
                'details.bookCopy.book',
            ]);

            ActivityLogger::log(
                'create',
                'book_return',
                "Processed return request for loan #{$loan->id} with " . count($returnedCopies) . " book(s) - Waiting for approval",
                [
                    'return_id' => $return->id,
                    'loan_id' => $loan->id,
                    'return_date' => $return->return_date,
                    'approval_status' => 'pending',
                    'returned_copies' => $returnedCopies,
                ]
            );

            return $return;
        });

        return ApiResponse::successResponse(
            'Permintaan pengembalian buku berhasil dibuat dan menunggu persetujuan admin',
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
