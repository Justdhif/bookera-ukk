<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Approval\RejectLoanRequest;
use App\Models\Loan;
use App\Services\Approval\ApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    private ApprovalService $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function approveLoan(Request $request, Loan $loan): JsonResponse
    {
        try {
            $loan = $this->approvalService->approveLoan($loan);

            return ApiResponse::successResponse('Peminjaman berhasil disetujui', $loan);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function rejectLoan(RejectLoanRequest $request, Loan $loan): JsonResponse
    {
        try {
            $loan = $this->approvalService->rejectLoan(
                $loan,
                $request->rejection_reason
            );

            return ApiResponse::successResponse('Peminjaman ditolak', $loan);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function markAsBorrowed(Request $request, Loan $loan): JsonResponse
    {
        try {
            $loan = $this->approvalService->markLoanAsBorrowed($loan);

            return ApiResponse::successResponse('Status peminjaman berhasil diubah menjadi borrowed', $loan);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function getApprovedLoans(Request $request): JsonResponse
    {
        $loans = $this->approvalService->getApprovedLoans($request->search);

        return ApiResponse::successResponse('Data peminjaman yang sudah di-approve dan menunggu penyerahan buku', $loans);
    }

    public function getAllReturns(Request $request): JsonResponse
    {
        $returns = $this->approvalService->getAllReturns($request->search);

        return ApiResponse::successResponse('Data semua pengembalian buku', $returns);
    }
}

