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
        $filters = [
            'search'          => $request->search,
            'approval_status' => $request->approval_status,
            'per_page'        => $request->per_page,
        ];

        $requests = $this->borrowRequestService->getAll($filters);

        return ApiResponse::successResponse('Borrow request data retrieved successfully', $requests);
    }

    public function show(BorrowRequest $borrowRequest): JsonResponse
    {
        $borrowRequest = $this->borrowRequestService->getById($borrowRequest);

        return ApiResponse::successResponse('Borrow request details', $borrowRequest);
    }

    public function assignBorrow(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $copyIds = $request->input('copy_ids', []);
        $borrow  = $this->borrowRequestService->assignBorrow($borrowRequest, $copyIds);

        return ApiResponse::successResponse('Borrow created from request successfully',
            $borrow,
            201
        );
    }

    public function approve(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $copyIds = $request->input('copy_ids', []);
        $borrow  = $this->borrowRequestService->approve($borrowRequest, $copyIds);

        return ApiResponse::successResponse('Borrow request approved successfully', $borrow, 201);
    }

    public function reject(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $rejectReason  = $request->input('reject_reason');
        $borrowRequest = $this->borrowRequestService->reject($borrowRequest, $rejectReason);

        return ApiResponse::successResponse('Borrow request rejected successfully', $borrowRequest);
    }

    public function destroy(BorrowRequest $borrowRequest): JsonResponse
    {
        $this->borrowRequestService->delete($borrowRequest);

        return ApiResponse::successResponse('Borrow request deleted successfully');
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    public function store(StoreBorrowRequestRequest $request): JsonResponse
    {
        $borrowRequest = $this->borrowRequestService->create(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse('Borrow request created successfully',
            $borrowRequest,
            201
        );
    }

    public function getMyRequests(Request $request): JsonResponse
    {
        $requests = $this->borrowRequestService->getByUser($request->user());

        return ApiResponse::successResponse('User borrow request data', $requests);
    }

    public function cancel(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        if ($borrowRequest->user_id !== $request->user()->id) {
            return ApiResponse::errorResponse('You are not authorized to cancel this request', null, 403);
        }

        $borrowRequest = $this->borrowRequestService->cancel($borrowRequest, $request->user());

        return ApiResponse::successResponse('Borrow request cancelled successfully', $borrowRequest);
    }
}
