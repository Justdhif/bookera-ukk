<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Approval\RejectBorrowRequest;
use App\Models\Borrow;
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

    public function approveBorrow(Request $request, Borrow $borrow): JsonResponse
    {
        try {
            $borrow = $this->approvalService->approveBorrow($borrow);

            return ApiResponse::successResponse('Semua salinan buku berhasil disetujui', $borrow);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function rejectBorrow(RejectBorrowRequest $request, Borrow $borrow): JsonResponse
    {
        try {
            $borrow = $this->approvalService->rejectBorrow(
                $borrow,
                $request->input('rejection_reason')
            );

            return ApiResponse::successResponse('Semua salinan buku ditolak', $borrow);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function markAsOpen(Request $request, Borrow $borrow): JsonResponse
    {
        try {
            $borrow = $this->approvalService->markBorrowAsOpen($borrow);

            return ApiResponse::successResponse('Status peminjaman berhasil diubah menjadi open', $borrow);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function getPendingBorrows(Request $request): JsonResponse
    {
        $borrows = $this->approvalService->getPendingBorrows($request->search);

        return ApiResponse::successResponse('Data peminjaman yang perlu diproses', $borrows);
    }

    public function getApprovedBorrows(Request $request): JsonResponse
    {
        $borrows = $this->approvalService->getApprovedBorrows($request->search);

        return ApiResponse::successResponse('Data peminjaman yang sudah di-approve dan menunggu penyerahan buku', $borrows);
    }

    public function getAllReturns(Request $request): JsonResponse
    {
        $returns = $this->approvalService->getAllReturns($request->search);

        return ApiResponse::successResponse('Data semua pengembalian buku', $returns);
    }
}
