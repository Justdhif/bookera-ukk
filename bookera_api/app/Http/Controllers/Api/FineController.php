<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Fine\StoreFineRequest;
use App\Http\Requests\Fine\UpdateFineRequest;
use App\Http\Requests\Fine\WaiveFineRequest;
use App\Models\FineBorrow;
use App\Models\Borrow;
use App\Services\Fine\FineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FineController extends Controller
{
    private FineService $fineService;

    public function __construct(FineService $fineService)
    {
        $this->fineService = $fineService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'status'   => $request->status,
            'per_page' => $request->per_page,
        ];

        $fines = $this->fineService->getAll($filters);

        return ApiResponse::successResponse('Data denda', $fines);
    }

    public function borrowFines(Borrow $borrow): JsonResponse
    {
        $fines = $this->fineService->getBorrowFines($borrow);

        return ApiResponse::successResponse('Data denda untuk peminjaman ini', $fines);
    }

    public function myFines(Request $request): JsonResponse
    {
        $fines = $this->fineService->getMyFines($request->user()->id);

        return ApiResponse::successResponse('Data denda saya', $fines);
    }

    public function store(StoreFineRequest $request, Borrow $borrow): JsonResponse
    {
        $fine = $this->fineService->create($borrow, $request->validated());

        return ApiResponse::successResponse('Denda berhasil dibuat', $fine, 201);
    }





    public function markAsPaid(Request $request, FineBorrow $fine): JsonResponse
    {
        if (!$this->fineService->canMarkAsPaid($fine)) {
            return ApiResponse::errorResponse('Denda ini sudah dibayar', null, 400);
        }

        $fine = $this->fineService->markAsPaid($fine);

        return ApiResponse::successResponse('Denda berhasil ditandai sebagai sudah dibayar', $fine);
    }

    public function waive(WaiveFineRequest $request, FineBorrow $fine): JsonResponse
    {
        if (!$this->fineService->canWaive($fine)) {
            return ApiResponse::errorResponse('Denda ini sudah dibatalkan', null, 400);
        }

        $validated = $request->validated();
        $fine = $this->fineService->waiveFine($fine, $validated['notes'] ?? null);

        return ApiResponse::successResponse('Denda berhasil dibatalkan', $fine);
    }

    public function destroy(FineBorrow $fine): JsonResponse
    {
        $this->fineService->delete($fine);

        return ApiResponse::successResponse('Denda berhasil dihapus');
    }
}
