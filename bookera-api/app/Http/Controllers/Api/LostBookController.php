<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\Loan;
use App\Models\LostBook;
use App\Models\BookCopy;
use App\Models\Fine;
use App\Models\FineType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LostBookController extends Controller
{
    /**
     * Get all lost books
     */
    public function index(Request $request)
    {
        $query = LostBook::with([
            'loan.user.profile',
            'loan.fines.fineType',
            'bookCopy.book',
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
                    ->orWhereHas('bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        $lostBooks = $query->latest()->get();

        return ApiResponse::successResponse(
            'Data buku hilang',
            $lostBooks
        );
    }

    /**
     * Report a lost book
     */
    public function store(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'book_copy_id' => 'required|integer|exists:book_copies,id',
            'estimated_lost_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Validate loan status
        if ($loan->status !== 'borrowed') {
            return ApiResponse::errorResponse(
                'Peminjaman ini tidak dalam status dipinjam',
                null,
                400
            );
        }

        // Check if book copy is part of this loan
        $loanDetail = $loan->details()
            ->where('book_copy_id', $data['book_copy_id'])
            ->first();

        if (!$loanDetail) {
            return ApiResponse::errorResponse(
                'Buku ini tidak termasuk dalam peminjaman',
                null,
                400
            );
        }

        // Check if already reported as lost
        $existingLostBook = LostBook::where('loan_id', $loan->id)
            ->where('book_copy_id', $data['book_copy_id'])
            ->first();

        if ($existingLostBook) {
            return ApiResponse::errorResponse(
                'Buku ini sudah dilaporkan hilang',
                null,
                400
            );
        }

        $lostBook = DB::transaction(function () use ($loan, $data) {
            $lostBook = LostBook::create([
                'loan_id' => $loan->id,
                'book_copy_id' => $data['book_copy_id'],
                'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            // Update book copy status to lost
            $bookCopy = BookCopy::find($data['book_copy_id']);
            $oldStatus = $bookCopy->status;

            $bookCopy->update([
                'status' => 'lost',
            ]);

            // Create fine for lost book
            $lostFineType = FineType::where('type', 'lost')->first();
            if ($lostFineType) {
                $fine = Fine::create([
                    'loan_id' => $loan->id,
                    'fine_type_id' => $lostFineType->id,
                    'amount' => $lostFineType->amount,
                    'status' => 'unpaid',
                    'notes' => 'Denda buku hilang: ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')',
                ]);

                ActivityLogger::log(
                    'create',
                    'fine',
                    "Fine created for lost book in loan #{$loan->id}",
                    [
                        'fine_id' => $fine->id,
                        'loan_id' => $loan->id,
                        'amount' => $fine->amount,
                        'fine_type' => 'lost',
                    ],
                    null,
                    $fine
                );
            }

            ActivityLogger::log(
                'update',
                'book_copy',
                "Book copy #{$bookCopy->id} ({$bookCopy->book->title}) reported as lost",
                [
                    'copy_id' => $bookCopy->id,
                    'new_status' => 'lost',
                    'loan_id' => $loan->id,
                ],
                [
                    'copy_id' => $bookCopy->id,
                    'old_status' => $oldStatus,
                ],
                $bookCopy
            );

            // Update loan status to 'checking' - waiting for admin approval/verification
            $oldLoanStatus = $loan->status;
            $loan->update([
                'status' => 'checking',
            ]);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} status changed to 'checking' - lost book reported, awaiting admin verification",
                ['loan_id' => $loan->id, 'new_status' => 'checking'],
                ['loan_id' => $loan->id, 'old_status' => $oldLoanStatus],
                $loan
            );

            ActivityLogger::log(
                'create',
                'lost_book',
                "Lost book reported for loan #{$loan->id}",
                [
                    'lost_book_id' => $lostBook->id,
                    'loan_id' => $loan->id,
                    'book_copy_id' => $data['book_copy_id'],
                    'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                ],
                null,
                $lostBook
            );

            $lostBook->load(['loan.user.profile', 'bookCopy.book']);

            return $lostBook;
        });

        return ApiResponse::successResponse(
            'Buku hilang berhasil dilaporkan',
            $lostBook,
            201
        );
    }

    /**
     * Get lost book detail
     */
    public function show(LostBook $lostBook)
    {
        $lostBook->load(['loan.user.profile', 'bookCopy.book']);

        return ApiResponse::successResponse(
            'Detail buku hilang',
            $lostBook
        );
    }

    /**
     * Update lost book information
     */
    public function update(Request $request, LostBook $lostBook)
    {
        $data = $request->validate([
            'estimated_lost_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $lostBook->update($data);

        ActivityLogger::log(
            'update',
            'lost_book',
            "Lost book #{$lostBook->id} information updated",
            [
                'lost_book_id' => $lostBook->id,
                'estimated_lost_date' => $data['estimated_lost_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ],
            null,
            $lostBook
        );

        $lostBook->load(['loan.user.profile', 'bookCopy.book']);

        return ApiResponse::successResponse(
            'Informasi buku hilang berhasil diupdate',
            $lostBook
        );
    }

    /**
     * Delete lost book record (if mistake)
     */
    public function destroy(LostBook $lostBook)
    {
        $bookCopy = $lostBook->bookCopy;

        ActivityLogger::log(
            'delete',
            'lost_book',
            "Lost book record #{$lostBook->id} deleted",
            [
                'lost_book_id' => $lostBook->id,
                'loan_id' => $lostBook->loan_id,
                'book_copy_id' => $lostBook->book_copy_id,
            ],
            null,
            $lostBook
        );

        $lostBook->delete();

        // Optionally restore book copy status to borrowed if loan is still active
        if ($lostBook->loan->status === 'borrowed') {
            $bookCopy->update(['status' => 'borrowed']);
        }

        return ApiResponse::successResponse(
            'Record buku hilang berhasil dihapus'
        );
    }

    /**
     * Finish lost book process (update loan status to lost)
     */
    public function finish(LostBook $lostBook)
    {
        $loan = $lostBook->loan;

        // Check if all fines are paid
        $unpaidFines = $loan->fines()->where('status', 'unpaid')->count();
        if ($unpaidFines > 0) {
            return ApiResponse::errorResponse(
                'Tidak dapat menyelesaikan proses buku hilang. Masih ada denda yang belum dibayar.',
                null,
                400
            );
        }

        DB::transaction(function () use ($loan, $lostBook) {
            $oldStatus = $loan->status;

            // Update loan status to lost
            $loan->update([
                'status' => 'lost',
            ]);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} marked as lost (finished lost book process)",
                [
                    'loan_id' => $loan->id,
                    'new_status' => 'lost',
                    'lost_book_id' => $lostBook->id,
                ],
                [
                    'loan_id' => $loan->id,
                    'old_status' => $oldStatus,
                ],
                $loan
            );
        });

        $lostBook->load(['loan.user.profile', 'bookCopy.book']);

        return ApiResponse::successResponse(
            'Proses buku hilang telah selesai. Status peminjaman diubah menjadi lost.',
            $lostBook
        );
    }
}
