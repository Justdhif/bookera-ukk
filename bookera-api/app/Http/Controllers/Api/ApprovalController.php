<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Approval\RejectLoanDetailRequest;
use App\Http\Requests\Approval\RejectLoanRequest;
use App\Models\Loan;
use App\Models\LoanDetail;
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

    public function approveLoanDetail(Request $request, LoanDetail $loanDetail): JsonResponse
    {
        try {
            $loanDetail = $this->approvalService->approveLoanDetail($loanDetail);

            return ApiResponse::successResponse('Salinan buku berhasil disetujui', $loanDetail->load(['loan.loanDetails.bookCopy.book', 'bookCopy.book']));
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function rejectLoanDetail(RejectLoanDetailRequest $request, LoanDetail $loanDetail): JsonResponse
    {
        try {
            $loanDetail = $this->approvalService->rejectLoanDetail(
                $loanDetail,
                $request->note
            );

            return ApiResponse::successResponse('Salinan buku ditolak', $loanDetail->load(['loan.loanDetails.bookCopy.book', 'bookCopy.book']));
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function approveLoan(Request $request, Loan $loan): JsonResponse
    {
        try {
            $loan = $this->approvalService->approveLoan($loan);

            return ApiResponse::successResponse('Semua salinan buku berhasil disetujui', $loan);
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

            return ApiResponse::successResponse('Semua salinan buku ditolak', $loan);
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

    public function getPendingLoans(Request $request): JsonResponse
    {
        $loans = $this->approvalService->getPendingLoans($request->search);

        return ApiResponse::successResponse('Data peminjaman yang perlu diproses', $loans);
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