<?php

namespace App\Http\Controllers\Api;

use App\Exports\FineExport;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Borrow;
use App\Models\FineBorrow;
use App\Services\Fine\FineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FineController extends Controller
{
    private FineService $fineService;

    public function __construct(FineService $fineService)
    {
        $this->fineService = $fineService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);

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

    public function markAsPaid(FineBorrow $fine): JsonResponse
    {
        if (!$this->fineService->canMarkAsPaid($fine)) {
            return ApiResponse::errorResponse('Denda ini sudah dibayar', null, 400);
        }

        $fine = $this->fineService->markAsPaid($fine);

        return ApiResponse::successResponse('Denda berhasil ditandai sebagai sudah dibayar', $fine);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->getFilters($request);

        return Excel::download(
            new FineExport($this->fineService->getExportData($filters)),
            'fines_data_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        );
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->search,
            'status' => $request->status,
            'per_page' => $request->per_page,
            'page' => $request->page,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];
    }
}
