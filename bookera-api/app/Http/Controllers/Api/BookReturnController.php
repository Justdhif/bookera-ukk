<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\Loan;
use App\Models\BookReturn;
use App\Models\Fine;
use App\Models\FineType;
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

    /**
     * Request book return - sets loan to "checking" status
     * Auto-creates fine for damaged books
     */
    public function store(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'copies' => 'required|array',
            'copies.*.book_copy_id' => 'required|integer|exists:book_copies,id',
            'copies.*.condition' => 'required|string|in:good,damaged',
        ]);

        // Validate loan status
        if ($loan->status !== 'borrowed') {
            return ApiResponse::errorResponse(
                'Peminjaman ini tidak dalam status dipinjam',
                null,
                400
            );
        }

        $bookReturn = DB::transaction(function () use ($loan, $data) {
            // Create return record
            $return = BookReturn::create([
                'loan_id' => $loan->id,
                'return_date' => now(),
            ]);

            $returnedCopies = [];
            $hasDamagedBooks = false;

            foreach ($data['copies'] as $copy) {
                $return->details()->create([
                    'book_copy_id' => $copy['book_copy_id'],
                    'condition' => $copy['condition'],
                ]);

                $loanDetail = $loan->details()
                    ->where('book_copy_id', $copy['book_copy_id'])
                    ->firstOrFail();

                $bookCopy = $loanDetail->bookCopy;

                // Check if damaged
                if ($copy['condition'] === 'damaged') {
                    $hasDamagedBooks = true;
                }

                $returnedCopies[] = [
                    'copy_id' => $bookCopy->id,
                    'book_title' => $bookCopy->book->title ?? 'Unknown',
                    'condition' => $copy['condition'],
                ];

                ActivityLogger::log(
                    'create',
                    'book_return_detail',
                    "Return requested for book copy #{$bookCopy->id} ({$bookCopy->book->title}) with condition '{$copy['condition']}'",
                    ['copy_id' => $bookCopy->id, 'condition' => $copy['condition']],
                    null,
                    $bookCopy
                );
            }

            // Set loan status to "checking" (pending admin approval)
            $oldLoanStatus = $loan->status;
            $loan->update([
                'status' => 'checking',
            ]);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} status changed to 'checking' - awaiting admin approval",
                ['loan_id' => $loan->id, 'new_status' => 'checking'],
                ['loan_id' => $loan->id, 'old_status' => $oldLoanStatus],
                $loan
            );

            // Auto-create fine for damaged books
            if ($hasDamagedBooks) {
                $damagedFineType = FineType::where('type', 'damaged')->first();
                
                if ($damagedFineType) {
                    $fine = Fine::create([
                        'loan_id' => $loan->id,
                        'fine_type_id' => $damagedFineType->id,
                        'amount' => $damagedFineType->amount,
                        'status' => 'unpaid',
                    ]);

                    ActivityLogger::log(
                        'create',
                        'fine',
                        "Auto-created damaged book fine for loan #{$loan->id}",
                        ['fine_id' => $fine->id, 'amount' => $fine->amount],
                        null,
                        $fine
                    );
                }
            }

            $return->load([
                'details.bookCopy.book',
            ]);

            ActivityLogger::log(
                'create',
                'book_return',
                "Return requested for loan #{$loan->id} with " . count($returnedCopies) . " book(s)",
                [
                    'return_id' => $return->id,
                    'loan_id' => $loan->id,
                    'return_date' => $return->return_date,
                    'returned_copies' => $returnedCopies,
                ],
                null,
                $return
            );

            return $return;
        });

        return ApiResponse::successResponse(
            'Request pengembalian berhasil dibuat. Menunggu persetujuan admin.',
            $bookReturn,
            201
        );
    }

    /**
     * Approve return - sets loan to "returned" and book copies status based on condition
     * Checks if all fines are paid/waived before approving damaged/lost books
     */
    public function approveReturn(BookReturn $bookReturn)
    {
        $loan = $bookReturn->loan;

        // Validate loan status
        if ($loan->status !== 'checking') {
            return ApiResponse::errorResponse(
                'Peminjaman ini tidak dalam status checking',
                null,
                400
            );
        }

        // Check if there are damaged or lost books
        $hasDamagedOrLostBooks = $bookReturn->details()
            ->whereIn('condition', ['damaged', 'lost'])
            ->exists();
        
        // If there are damaged/lost books, check if all fines are paid/waived
        if ($hasDamagedOrLostBooks) {
            $unpaidFines = $loan->fines()->where('status', 'unpaid')->exists();
            
            if ($unpaidFines) {
                return ApiResponse::errorResponse(
                    'Tidak dapat menyelesaikan return. Masih ada denda yang belum dibayar.',
                    null,
                    400
                );
            }
        }

        DB::transaction(function () use ($loan, $bookReturn) {
            // Update all book copies status based on condition
            foreach ($bookReturn->details as $detail) {
                $bookCopy = $detail->bookCopy;
                $oldStatus = $bookCopy->status;
                
                // Set status based on condition
                $newStatus = match($detail->condition) {
                    'good' => 'available',
                    'damaged' => 'damaged',
                    'lost' => 'lost',
                    default => 'available'
                };
                
                $bookCopy->update([
                    'status' => $newStatus,
                ]);

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$bookCopy->id} status changed to '{$newStatus}' (condition: {$detail->condition})",
                    ['copy_id' => $bookCopy->id, 'new_status' => $newStatus, 'condition' => $detail->condition],
                    ['copy_id' => $bookCopy->id, 'old_status' => $oldStatus],
                    $bookCopy
                );
            }

            // Update loan status to returned
            $oldLoanStatus = $loan->status;
            $loan->update([
                'status' => 'returned',
            ]);

            ActivityLogger::log(
                'update',
                'loan',
                "Loan #{$loan->id} finished - status changed to 'returned'",
                ['loan_id' => $loan->id, 'new_status' => 'returned'],
                ['loan_id' => $loan->id, 'old_status' => $oldLoanStatus],
                $loan
            );
        });

        return ApiResponse::successResponse(
            'Pengembalian berhasil diselesaikan',
            $bookReturn->load('details.bookCopy.book', 'loan')
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
