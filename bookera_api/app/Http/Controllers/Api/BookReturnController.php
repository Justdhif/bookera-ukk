<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookReturn\StoreBookReturnRequest;
use App\Http\Requests\BookReturn\UpdateBookReturnConditionsRequest;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Services\BookReturn\BookReturnService;
use Exception;
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

        return ApiResponse::successResponse('Data pengembalian buku berhasil diambil', $returns);
    }

    public function store(StoreBookReturnRequest $request, Borrow $borrow): JsonResponse
    {
        if (!$this->bookReturnService->canCreate($borrow)) {
            return ApiResponse::errorResponse('Peminjaman ini tidak dalam status open', null, 400);
        }

        $bookReturn = $this->bookReturnService->create($borrow, $request->validated());

        return ApiResponse::successResponse('Request pengembalian berhasil dibuat. Menunggu persetujuan admin.', $bookReturn, 201);
    }

    public function show(BookReturn $bookReturn): JsonResponse
    {
        $detail = $this->bookReturnService->getDetail($bookReturn);

        return ApiResponse::successResponse('Detail pengembalian buku', $detail);
    }

    public function updateConditions(UpdateBookReturnConditionsRequest $request, BookReturn $bookReturn): JsonResponse
    {
        try {
            $result = $this->bookReturnService->updateConditions($bookReturn, $request->validated()['conditions']);
            return ApiResponse::successResponse('Kondisi buku berhasil diperbarui', $result);
        } catch (Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function finishFines(BookReturn $bookReturn): JsonResponse
    {
        try {
            $fines = $this->bookReturnService->finishFines($bookReturn);
            return ApiResponse::successResponse('Semua denda berhasil ditandai sebagai lunas', $fines);
        } catch (Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

}