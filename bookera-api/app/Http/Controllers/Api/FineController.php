<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Fine\StoreFineRequest;
use App\Http\Requests\Fine\UpdateFineRequest;
use App\Http\Requests\Fine\WaiveFineRequest;
use App\Models\Fine;
use App\Models\Loan;
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
        $fines = $this->fineService->getAllFines($request->status, $request->search);

        return ApiResponse::successResponse('Data denda', $fines);
    }

    public function loanFines(Loan $loan): JsonResponse
    {
        $fines = $this->fineService->getLoanFines($loan);

        return ApiResponse::successResponse('Data denda untuk peminjaman ini', $fines);
    }

    public function myFines(Request $request): JsonResponse
    {
        $fines = $this->fineService->getMyFines($request->user()->id);

        return ApiResponse::successResponse('Data denda saya', $fines);
    }

    public function store(StoreFineRequest $request, Loan $loan): JsonResponse
    {
        $fine = $this->fineService->createFine($loan, $request->validated());

        return ApiResponse::successResponse('Denda berhasil dibuat', $fine, 201);
    }

    public function show(Fine $fine): JsonResponse
    {
        $fine->load(['loan.user.profile', 'fineType']);

        return ApiResponse::successResponse('Detail denda', $fine);
    }

    public function update(UpdateFineRequest $request, Fine $fine): JsonResponse
    {
        $fine = $this->fineService->updateFine($fine, $request->validated());

        return ApiResponse::successResponse('Denda berhasil diupdate', $fine);
    }

    public function markAsPaid(Request $request, Fine $fine): JsonResponse
    {
        if (!$this->fineService->canMarkAsPaid($fine)) {
            return ApiResponse::errorResponse('Denda ini sudah dibayar', null, 400);
        }

        $fine = $this->fineService->markAsPaid($fine);

        return ApiResponse::successResponse('Denda berhasil ditandai sebagai sudah dibayar', $fine);
    }

    public function waive(WaiveFineRequest $request, Fine $fine): JsonResponse
    {
        if (!$this->fineService->canWaive($fine)) {
            return ApiResponse::errorResponse('Denda ini sudah dibatalkan', null, 400);
        }

        $validated = $request->validated();
        $fine = $this->fineService->waiveFine($fine, $validated['notes'] ?? null);

        return ApiResponse::successResponse('Denda berhasil dibatalkan', $fine);
    }

    public function destroy(Fine $fine): JsonResponse
    {
        $this->fineService->deleteFine($fine);

        return ApiResponse::successResponse('Denda berhasil dihapus');
    }
}
