<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Borrow\StoreAdminBorrowRequest;
use App\Http\Requests\Borrow\StoreBorrowRequest;
use App\Http\Requests\Borrow\UpdateBorrowRequest;
use App\Models\Borrow;
use App\Services\Borrow\BorrowService;
use App\Services\BorrowRequest\BorrowRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BorrowController extends Controller
{
    private BorrowService $borrowService;
    private BorrowRequestService $borrowRequestService;

    public function __construct(BorrowService $borrowService, BorrowRequestService $borrowRequestService)
    {
        $this->borrowService        = $borrowService;
        $this->borrowRequestService = $borrowRequestService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'status'   => $request->status,
            'per_page' => $request->per_page,
        ];

        $borrows = $this->borrowService->getAll($filters);

        return ApiResponse::successResponse('Borrow data retrieved successfully', $borrows);
    }

    public function store(StoreBorrowRequest $request): JsonResponse
    {
        $borrow = $this->borrowService->create(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse('Borrow request created and waiting for admin approval',
            $borrow,
            201
        );
    }

    public function storeAdminBorrow(StoreAdminBorrowRequest $request): JsonResponse
    {
        $borrow = $this->borrowService->createAdmin(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse('Direct borrow created successfully with open status',
            $borrow,
            201
        );
    }



    public function showByCode(string $code): JsonResponse
    {
        $borrow = $this->borrowService->getByCode($code);

        return ApiResponse::successResponse('Borrow details', $borrow);
    }

    public function update(UpdateBorrowRequest $request, Borrow $borrow): JsonResponse
    {
        $borrow = $this->borrowService->update($borrow, $request->validated());

        return ApiResponse::successResponse('Borrow updated successfully', $borrow);
    }

    public function getBorrowByUser(Request $request): JsonResponse
    {
        $borrows = $this->borrowService->getByUser($request->user());

        return ApiResponse::successResponse('User borrow data', $borrows);
    }

    public function assignCopies(Request $request, Borrow $borrow): JsonResponse
    {
        if (! $borrow->borrow_request_id) {
            return ApiResponse::errorResponse('This borrow was not created from a request', null, 422);
        }

        if ($borrow->borrowDetails()->count() > 0) {
            return ApiResponse::errorResponse('Book copies have already been assigned to this borrow', null, 422);
        }

        $copyIds = $request->input('copy_ids', []);

        $borrow = $this->borrowRequestService->addCopiesToBorrow($borrow, $copyIds);

        return ApiResponse::successResponse('Book copies assigned to borrow successfully', $borrow);
    }

    public function complete(Borrow $borrow): JsonResponse
    {
        try {
            $borrow = $this->borrowService->complete($borrow);

            return ApiResponse::successResponse('Borrow completed and closed successfully', $borrow);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }
}
