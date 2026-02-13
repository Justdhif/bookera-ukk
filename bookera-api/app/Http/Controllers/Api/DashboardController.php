<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    private DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function totals(): JsonResponse
    {
        $data = $this->dashboardService->getTotals();

        return ApiResponse::successResponse('Data total dashboard berhasil diambil', $data);
    }

    public function loanMonthlyChart(): JsonResponse
    {
        $data = $this->dashboardService->getLoanMonthlyChart();

        return ApiResponse::successResponse('Data grafik peminjaman bulanan', $data);
    }

    public function loanStatusChart(): JsonResponse
    {
        $data = $this->dashboardService->getLoanStatusChart();

        return ApiResponse::successResponse('Data grafik status peminjaman', $data);
    }

    public function latest(): JsonResponse
    {
        $data = $this->dashboardService->getLatestLoans();

        return ApiResponse::successResponse('Data peminjaman terbaru', $data);
    }
}

