<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookReturn\StoreBookReturnRequest;
use App\Http\Requests\BookReturn\UpdateBookReturnConditionsRequest;
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
        $returns = $this->bookReturnService->getReturnsByBorrow($borrow);

        return ApiResponse::successResponse('Data pengembalian buku berhasil diambil', $returns);
    }

    public function store(StoreBookReturnRequest $request, Borrow $borrow): JsonResponse
    {
        if (!$this->bookReturnService->canCreateReturn($borrow)) {
            return ApiResponse::errorResponse('Peminjaman ini tidak dalam status open', null, 400);
        }

        $bookReturn = $this->bookReturnService->createReturn($borrow, $request->validated());

        return ApiResponse::successResponse('Request pengembalian berhasil dibuat. Menunggu persetujuan admin.', $bookReturn, 201);
    }

    public function show(BookReturn $bookReturn): JsonResponse
    {
        $detail = $this->bookReturnService->getReturnDetail($bookReturn);

        return ApiResponse::successResponse('Detail pengembalian buku', $detail);
    }

    public function updateConditions(UpdateBookReturnConditionsRequest $request, BookReturn $bookReturn): JsonResponse
    {
        try {
            $result = $this->bookReturnService->updateConditions($bookReturn, $request->validated()['conditions']);
            return ApiResponse::successResponse('Kondisi buku berhasil diperbarui', $result);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function finishFines(BookReturn $bookReturn): JsonResponse
    {
        try {
            $fines = $this->bookReturnService->finishFines($bookReturn);
            return ApiResponse::successResponse('Semua denda berhasil ditandai sebagai lunas', $fines);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function approveReturn(BookReturn $bookReturn): JsonResponse
    {
        try {
            if (!$this->bookReturnService->canApproveReturn($bookReturn)) {
                $borrow = $bookReturn->borrow;

                if ($borrow->status !== 'open') {
                    return ApiResponse::errorResponse('Peminjaman ini tidak dalam status open', null, 400);
                }

                return ApiResponse::errorResponse('Tidak dapat menyelesaikan return', null, 400);
            }

            $result = $this->bookReturnService->approveReturn($bookReturn);
            return ApiResponse::successResponse('Pengembalian berhasil diselesaikan', $result);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function processFine(BookReturn $bookReturn): JsonResponse
    {
        try {
            $fine = $this->bookReturnService->processFine($bookReturn);
            return ApiResponse::successResponse('Denda berhasil diproses', $fine, 201);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }
}

