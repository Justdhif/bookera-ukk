<?php

namespace App\Http\Controllers\Api;

use App\Exports\BookReturnExport;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookReturn\StoreBookReturnRequest;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Services\BookReturn\BookReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BookReturnController extends Controller
{
    private BookReturnService $bookReturnService;

    public function __construct(BookReturnService $bookReturnService)
    {
        $this->bookReturnService = $bookReturnService;
    }

    public function index(Borrow $borrow): JsonResponse
    {
        $returns = $this->bookReturnService->getByBorrow($borrow);

        return ApiResponse::successResponse('Book return data retrieved successfully', $returns);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $returns = $this->bookReturnService->getAll($filters);

        return ApiResponse::successResponse('Book return data retrieved successfully', $returns);
    }

    public function store(StoreBookReturnRequest $request, Borrow $borrow): JsonResponse
    {
        if (!$this->bookReturnService->canCreate($borrow)) {
            return ApiResponse::errorResponse('This borrow is not in open status', null, 400);
        }

        $bookReturn = $this->bookReturnService->create($borrow, $request->validated());

        return ApiResponse::successResponse('Return request created successfully. Waiting for admin approval.', $bookReturn, 201);
    }

    public function show(BookReturn $bookReturn): JsonResponse
    {
        $detail = $this->bookReturnService->getDetail($bookReturn);

        return ApiResponse::successResponse('Book return details', $detail);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->getFilters($request);

        return Excel::download(
            new BookReturnExport($this->bookReturnService->getExportData($filters)),
            'returns_data_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        );
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->search,
            'per_page' => $request->per_page,
            'page' => $request->page,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];
    }

}