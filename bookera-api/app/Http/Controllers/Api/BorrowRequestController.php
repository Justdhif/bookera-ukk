<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BorrowRequest\StoreBorrowRequestRequest;
use App\Models\BorrowRequest;
use App\Services\BorrowRequest\BorrowRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BorrowRequestController extends Controller
{
    private BorrowRequestService $borrowRequestService;

    public function __construct(BorrowRequestService $borrowRequestService)
    {
        $this->borrowRequestService = $borrowRequestService;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $requests = $this->borrowRequestService->getRequests($request->search);

        return ApiResponse::successResponse('Data permintaan peminjaman berhasil diambil', $requests);
    }

    public function show(BorrowRequest $borrowRequest): JsonResponse
    {
        $borrowRequest = $this->borrowRequestService->getRequestById($borrowRequest);

        return ApiResponse::successResponse('Detail permintaan peminjaman', $borrowRequest);
    }

    public function assignBorrow(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $copyIds = $request->input('copy_ids', []);
        $borrow  = $this->borrowRequestService->assignBorrowFromRequest($borrowRequest, $copyIds);

        return ApiResponse::successResponse(
            'Peminjaman berhasil dibuat dari permintaan',
            $borrow,
            201
        );
    }

    public function approve(BorrowRequest $borrowRequest): JsonResponse
    {
        $borrow = $this->borrowRequestService->approveRequest($borrowRequest);

        return ApiResponse::successResponse('Permintaan peminjaman berhasil disetujui', $borrow, 201);
    }

    public function reject(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $rejectReason  = $request->input('reject_reason');
        $borrowRequest = $this->borrowRequestService->rejectRequest($borrowRequest, $rejectReason);

        return ApiResponse::successResponse('Permintaan peminjaman berhasil ditolak', $borrowRequest);
    }

    public function destroy(BorrowRequest $borrowRequest): JsonResponse
    {
        $this->borrowRequestService->deleteRequest($borrowRequest);

        return ApiResponse::successResponse('Permintaan peminjaman berhasil dihapus');
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    public function store(StoreBorrowRequestRequest $request): JsonResponse
    {
        $borrowRequest = $this->borrowRequestService->createRequest(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse(
            'Permintaan peminjaman berhasil dibuat',
            $borrowRequest,
            201
        );
    }

    public function getMyRequests(Request $request): JsonResponse
    {
        $requests = $this->borrowRequestService->getRequestsByUser($request->user());

        return ApiResponse::successResponse('Data permintaan peminjaman user', $requests);
    }

    public function cancel(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        if ($borrowRequest->user_id !== $request->user()->id) {
            return ApiResponse::errorResponse('Kamu tidak berhak membatalkan permintaan ini', null, 403);
        }

        $borrowRequest = $this->borrowRequestService->cancelRequest($borrowRequest, $request->user());

        return ApiResponse::successResponse('Permintaan peminjaman berhasil dibatalkan', $borrowRequest);
    }
}
