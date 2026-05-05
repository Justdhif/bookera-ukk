<?php

namespace App\Http\Controllers\Api;

use App\Exports\BorrowRequestExport;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BorrowRequest\StoreBorrowRequestRequest;
use App\Models\BorrowRequest;
use App\Services\BorrowRequest\BorrowRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date,
            'per_page'        => $request->per_page,
        ];

        $requests = $this->borrowRequestService->getAll($filters);

        return ApiResponse::successResponse('Borrow request data retrieved successfully', $requests);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = [
            'search'          => $request->search,
            'approval_status' => $request->approval_status,
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date,
        ];

        return Excel::download(
            new BorrowRequestExport($this->borrowRequestService->getExportData($filters)),
            'borrow_requests_data_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        );
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

        return ApiResponse::successResponse('Borrow copies assigned successfully',
            $borrow,
            201
        );
    }

    public function approve(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $detailId = (int) $request->input('detail_id');
        $borrowRequest = $this->borrowRequestService->approve($borrowRequest, $detailId);

        return ApiResponse::successResponse('Borrow request item approved successfully', $borrowRequest);
    }

    public function reject(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        $detailId      = (int) $request->input('detail_id');
        $rejectReason  = $request->input('reject_reason');
        $borrowRequest = $this->borrowRequestService->reject($borrowRequest, $detailId, $rejectReason);

        return ApiResponse::successResponse('Borrow request item rejected successfully', $borrowRequest);
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
