<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookReturn\StoreBookReturnRequest;
use App\Models\BookReturn;
use App\Models\Loan;
use App\Services\BookReturn\BookReturnService;
use Illuminate\Http\JsonResponse;

class BookReturnController extends Controller
{
    private BookReturnService $bookReturnService;

    public function __construct(BookReturnService $bookReturnService)
    {
        $this->bookReturnService = $bookReturnService;
    }

    public function index(Loan $loan): JsonResponse
    {
        $returns = $this->bookReturnService->getReturnsByLoan($loan);

        return ApiResponse::successResponse('Data pengembalian buku berhasil diambil', $returns);
    }

    public function store(StoreBookReturnRequest $request, Loan $loan): JsonResponse
    {
        if (!$this->bookReturnService->canCreateReturn($loan)) {
            return ApiResponse::errorResponse('Peminjaman ini tidak dalam status dipinjam', null, 400);
        }

        $bookReturn = $this->bookReturnService->createReturn($loan, $request->validated());

        return ApiResponse::successResponse('Request pengembalian berhasil dibuat. Menunggu persetujuan admin.', $bookReturn, 201);
    }

    public function approveReturn(BookReturn $bookReturn): JsonResponse
    {
        if (!$this->bookReturnService->canApproveReturn($bookReturn)) {
            $loan = $bookReturn->loan;

            if ($loan->status !== 'checking') {
                return ApiResponse::errorResponse('Peminjaman ini tidak dalam status checking', null, 400);
            }

            return ApiResponse::errorResponse('Tidak dapat menyelesaikan return', null, 400);
        }

        $result = $this->bookReturnService->approveReturn($bookReturn);

        return ApiResponse::successResponse('Pengembalian berhasil diselesaikan', $result);
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

    public function show(BookReturn $bookReturn): JsonResponse
    {
        return ApiResponse::successResponse('Detail pengembalian buku', $bookReturn);
    }
}
