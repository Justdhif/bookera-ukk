<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookReturn\StoreBookReturnRequest;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Services\BookReturn\BookReturnService;
use Illuminate\Http\JsonResponse;

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

}