<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

            $return = BookReturn::create([
                'loan_id' => $loan->id,
                'return_date' => now(),
            ]);

            foreach ($data['copies'] as $copy) {

                $return->details()->create([
                    'book_copy_id' => $copy['book_copy_id'],
                    'condition' => $copy['condition'] ?? 'good',
                ]);

                $loanDetail = $loan->details()
                    ->where('book_copy_id', $copy['book_copy_id'])
                    ->firstOrFail();

                $bookCopy = $loanDetail->bookCopy;

                $bookCopy->update([
                    'status' => ($copy['condition'] ?? 'good') === 'lost'
                        ? 'lost'
                        : 'available',
                ]);
            }

            $loan->update([
                'status' => 'returned',
            ]);

            $return->load([
                'details.bookCopy.book',
            ]);

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
