<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

            foreach ($data['book_copy_ids'] as $copyId) {

                $copy = BookCopy::where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $loan->loanDetails()->create([
                    'book_copy_id' => $copy->id,
                ]);

                $copy->update([
                    'status' => 'borrowed',
                ]);
            }

            $loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

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

            $loan->update([
                'due_date' => $data['due_date'],
            ]);

            foreach ($data['book_copy_ids'] as $copyId) {

                $copy = BookCopy::where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $loan->loanDetails()->create([
                    'book_copy_id' => $copy->id,
                ]);

                $copy->update([
                    'status' => 'borrowed',
                ]);
            }

            $loan->load([
                'loanDetails.bookCopy.book',
                'user',
            ]);

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
