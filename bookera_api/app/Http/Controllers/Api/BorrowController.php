<?php

namespace App\Http\Controllers\Api;

use App\Exports\BorrowExport;
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
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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
        $filters = $this->getFilters($request);

        $borrows = $this->borrowService->getAll($filters);

        return ApiResponse::successResponse(__('Borrow data retrieved successfully'), $borrows);
    }

    public function store(StoreBorrowRequest $request): JsonResponse
    {
        $borrow = $this->borrowService->create(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse(__('Borrow request created and waiting for admin approval'),
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

        return ApiResponse::successResponse(__('Direct borrow created successfully with open status'),
            $borrow,
            201
        );
    }



    public function showByCode(string $code): JsonResponse
    {
        $borrow = $this->borrowService->getByCode($code);

        return ApiResponse::successResponse(__('Borrow details'), $borrow);
    }

    public function update(UpdateBorrowRequest $request, Borrow $borrow): JsonResponse
    {
        $borrow = $this->borrowService->update($borrow, $request->validated());

        return ApiResponse::successResponse(__('Borrow updated successfully'), $borrow);
    }

    public function getBorrowByUser(Request $request): JsonResponse
    {
        $filters = [
            'search'     => $request->search,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
        ];
        $borrows = $this->borrowService->getByUser($request->user(), $filters);

        return ApiResponse::successResponse(__('User borrow data'), $borrows);
    }

    public function assignCopies(Request $request, Borrow $borrow): JsonResponse
    {
        if (! $borrow->borrow_request_id) {
            return ApiResponse::errorResponse(__('This borrow was not created from a request'), null, 422);
        }

        if ($borrow->borrowDetails()->count() > 0) {
            return ApiResponse::errorResponse(__('Book copies have already been assigned to this borrow'), null, 422);
        }

        $copyIds = $request->input('copy_ids', []);

        $borrow = $this->borrowRequestService->addCopiesToBorrow($borrow, $copyIds);

        return ApiResponse::successResponse(__('Book copies assigned to borrow successfully'), $borrow);
    }

    public function complete(Borrow $borrow): JsonResponse
    {
        try {
            $borrow = $this->borrowService->complete($borrow);

            return ApiResponse::successResponse(__('Borrow completed and closed successfully'), $borrow);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->getFilters($request);

        return Excel::download(
            new BorrowExport($this->borrowService->getExportData($filters)),
            'borrows_data_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        );
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->search,
            'status' => $request->status,
            'per_page' => $request->per_page,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];
    }
}
