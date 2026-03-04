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
        $borrows = $this->borrowService->getBorrows($request->search);

        return ApiResponse::successResponse('Data peminjaman berhasil diambil', $borrows);
    }

    public function store(StoreBorrowRequest $request): JsonResponse
    {
        $borrow = $this->borrowService->createBorrow(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse(
            'Permintaan peminjaman berhasil dibuat dan menunggu persetujuan admin',
            $borrow,
            201
        );
    }

    public function storeAdminBorrow(StoreAdminBorrowRequest $request): JsonResponse
    {
        $borrow = $this->borrowService->createAdminBorrow(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse(
            'Peminjaman langsung berhasil dibuat dengan status open',
            $borrow,
            201
        );
    }

    public function show(Borrow $borrow): JsonResponse
    {
        $borrow = $this->borrowService->getBorrowById($borrow);

        return ApiResponse::successResponse('Detail peminjaman', $borrow);
    }

    public function showByCode(string $code): JsonResponse
    {
        $borrow = $this->borrowService->getBorrowByCode($code);

        return ApiResponse::successResponse('Detail peminjaman', $borrow);
    }

    public function update(UpdateBorrowRequest $request, Borrow $borrow): JsonResponse
    {
        $borrow = $this->borrowService->updateBorrow($borrow, $request->validated());

        return ApiResponse::successResponse('Peminjaman berhasil diupdate', $borrow);
    }

    public function getBorrowByUser(Request $request): JsonResponse
    {
        $borrows = $this->borrowService->getBorrowsByUser($request->user());

        return ApiResponse::successResponse('Data peminjaman user', $borrows);
    }

    public function assignCopies(Request $request, Borrow $borrow): JsonResponse
    {
        if (! $borrow->borrow_request_id) {
            return ApiResponse::errorResponse('Borrow ini tidak berasal dari request', null, 422);
        }

        if ($borrow->borrowDetails()->count() > 0) {
            return ApiResponse::errorResponse('Buku salinan sudah pernah di-assign ke peminjaman ini', null, 422);
        }

        $copyIds = $request->input('copy_ids', []);

        $borrow = $this->borrowRequestService->addCopiesToBorrow($borrow, $copyIds);

        return ApiResponse::successResponse('Buku salinan berhasil di-assign ke peminjaman', $borrow);
    }
}