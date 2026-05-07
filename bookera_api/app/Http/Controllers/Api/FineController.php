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
        $filters = $this->getFilters($request);
        $fines = $this->fineService->getMyFines($request->user()->id, $filters);

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

    public function payFineMidtrans(FineBorrow $fine): JsonResponse
    {
        if (!$this->fineService->canMarkAsPaid($fine)) {
            return ApiResponse::errorResponse('Denda ini sudah dibayar', null, 400);
        }

        try {
            $transactionData = $this->fineService->createMidtransTransaction($fine);
            return ApiResponse::successResponse('Transaksi Midtrans berhasil dibuat', $transactionData);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Gagal membuat transaksi Midtrans: ' . $e->getMessage(), null, 500);
        }
    }

    public function payFineCash(FineBorrow $fine): JsonResponse
    {
        if (!$this->fineService->canMarkAsPaid($fine)) {
            return ApiResponse::errorResponse('Denda ini sudah dibayar', null, 400);
        }

        $fine = $this->fineService->payCash($fine);

        return ApiResponse::successResponse('Denda berhasil dibayar tunai', $fine);
    }

    public function checkPaymentStatus(Request $request, FineBorrow $fine): JsonResponse
    {
        if ($fine->order_id) {
            try {
                $status = \Midtrans\Transaction::status($fine->order_id);
                $this->fineService->handlePaymentNotification($status);
                $fine->refresh();
            } catch (\Exception $e) {
                // Ignore status check errors
            }
        }

        return ApiResponse::successResponse('Status pembayaran denda', [
            'fine' => $fine->load(['borrow.user.profile', 'fineType']),
            'is_paid' => $fine->status === 'paid'
        ]);
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
