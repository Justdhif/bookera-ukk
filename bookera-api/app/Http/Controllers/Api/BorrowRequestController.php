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

    public function index(Request $request): JsonResponse
    {
        $requests = $this->borrowRequestService->getRequests($request->search);

        return ApiResponse::successResponse('Data permintaan peminjaman berhasil diambil', $requests);
    }

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

    public function show(BorrowRequest $borrowRequest): JsonResponse
    {
        $borrowRequest = $this->borrowRequestService->getRequestById($borrowRequest);

        return ApiResponse::successResponse('Detail permintaan peminjaman', $borrowRequest);
    }

    public function showByCode(string $code): JsonResponse
    {
        $borrowRequest = $this->borrowRequestService->getRequestByCode($code);

        return ApiResponse::successResponse('Detail permintaan peminjaman', $borrowRequest);
    }

    public function getMyRequests(Request $request): JsonResponse
    {
        $requests = $this->borrowRequestService->getRequestsByUser($request->user());

        return ApiResponse::successResponse('Data permintaan peminjaman user', $requests);
    }

    public function assignBorrow(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $copyIds = $request->input('copy_ids', []);
        $borrow = $this->borrowRequestService->assignBorrowFromRequest($borrowRequest, $copyIds);

        return ApiResponse::successResponse(
            'Peminjaman berhasil dibuat dari permintaan',
            $borrow,
            201
        );
    }

    public function destroy(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $user = $request->user();

        // Non-admin users can only delete their own requests
        if (!in_array($user->role, ['admin', 'officer:management']) && $borrowRequest->user_id !== $user->id) {
            return ApiResponse::errorResponse('Kamu tidak berhak menghapus permintaan ini', null, 403);
        }

        $this->borrowRequestService->deleteRequest($borrowRequest);

        return ApiResponse::successResponse('Permintaan peminjaman berhasil dihapus');
    }
}
