<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\Loan;
use App\Models\Fine;
use App\Models\FineType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FineController extends Controller
{
    /**
     * Get all fines
     */
    public function index(Request $request)
    {
        $query = Fine::with([
            'loan.user.profile',
            'fineType',
        ]);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

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
                    ->orWhereHas('fineType', function ($fineTypeQuery) use ($search) {
                        $fineTypeQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $fines = $query->latest()->get();

        return ApiResponse::successResponse(
            'Data denda',
            $fines
        );
    }

    /**
     * Get fines for a specific loan
     */
    public function loanFines(Loan $loan)
    {
        $fines = Fine::with(['fineType'])
            ->where('loan_id', $loan->id)
            ->latest()
            ->get();

        return ApiResponse::successResponse(
            'Data denda untuk peminjaman ini',
            $fines
        );
    }

    /**
     * Create new fine for a loan
     */
    public function store(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'fine_type_id' => 'required|integer|exists:fine_types,id',
            'amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $fineType = FineType::findOrFail($data['fine_type_id']);

        $fine = DB::transaction(function () use ($loan, $fineType, $data) {
            $amount = $data['amount'] ?? $fineType->amount;

            $fine = Fine::create([
                'loan_id' => $loan->id,
                'fine_type_id' => $fineType->id,
                'amount' => $amount,
                'status' => 'unpaid',
                'notes' => $data['notes'] ?? null,
            ]);

            ActivityLogger::log(
                'create',
                'fine',
                "Fine created for loan #{$loan->id} - {$fineType->name}",
                [
                    'fine_id' => $fine->id,
                    'loan_id' => $loan->id,
                    'fine_type' => $fineType->name,
                    'amount' => $amount,
                    'status' => 'unpaid',
                ],
                null,
                $fine
            );

            $fine->load(['loan.user.profile', 'fineType']);

            return $fine;
        });

        return ApiResponse::successResponse(
            'Denda berhasil dibuat',
            $fine,
            201
        );
    }

    /**
     * Get fine detail
     */
    public function show(Fine $fine)
    {
        $fine->load(['loan.user.profile', 'fineType']);

        return ApiResponse::successResponse(
            'Detail denda',
            $fine
        );
    }

    /**
     * Update fine
     */
    public function update(Request $request, Fine $fine)
    {
        $data = $request->validate([
            'amount' => 'sometimes|required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $oldData = $fine->toArray();
        $fine->update($data);

        ActivityLogger::log(
            'update',
            'fine',
            "Fine #{$fine->id} updated",
            [
                'fine_id' => $fine->id,
                'amount' => $fine->amount,
                'notes' => $fine->notes,
            ],
            $oldData,
            $fine
        );

        $fine->load(['loan.user.profile', 'fineType']);

        return ApiResponse::successResponse(
            'Denda berhasil diupdate',
            $fine
        );
    }

    /**
     * Mark fine as paid
     */
    public function markAsPaid(Request $request, Fine $fine)
    {
        if ($fine->status === 'paid') {
            return ApiResponse::errorResponse(
                'Denda ini sudah dibayar',
                null,
                400
            );
        }

        $fine->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        ActivityLogger::log(
            'update',
            'fine',
            "Fine #{$fine->id} marked as paid",
            [
                'fine_id' => $fine->id,
                'status' => 'paid',
                'paid_at' => $fine->paid_at,
            ],
            ['status' => 'unpaid'],
            $fine
        );

        $fine->load(['loan.user.profile', 'fineType']);

        return ApiResponse::successResponse(
            'Denda berhasil ditandai sebagai sudah dibayar',
            $fine
        );
    }

    /**
     * Waive fine (cancel/forgive)
     */
    public function waive(Request $request, Fine $fine)
    {
        $data = $request->validate([
            'notes' => 'nullable|string',
        ]);

        if ($fine->status === 'waived') {
            return ApiResponse::errorResponse(
                'Denda ini sudah dibatalkan',
                null,
                400
            );
        }

        $oldStatus = $fine->status;

        $fine->update([
            'status' => 'waived',
            'notes' => $data['notes'] ?? $fine->notes,
        ]);

        ActivityLogger::log(
            'update',
            'fine',
            "Fine #{$fine->id} waived",
            [
                'fine_id' => $fine->id,
                'status' => 'waived',
                'notes' => $fine->notes,
            ],
            ['status' => $oldStatus],
            $fine
        );

        $fine->load(['loan.user.profile', 'fineType']);

        return ApiResponse::successResponse(
            'Denda berhasil dibatalkan',
            $fine
        );
    }

    /**
     * Delete fine
     */
    public function destroy(Fine $fine)
    {
        ActivityLogger::log(
            'delete',
            'fine',
            "Fine #{$fine->id} deleted",
            [
                'fine_id' => $fine->id,
                'loan_id' => $fine->loan_id,
                'fine_type' => $fine->fineType->name ?? 'Unknown',
                'amount' => $fine->amount,
            ],
            null,
            $fine
        );

        $fine->delete();

        return ApiResponse::successResponse(
            'Denda berhasil dihapus'
        );
    }
}
