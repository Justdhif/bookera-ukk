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

    public function topBorrowedCategories(\Illuminate\Http\Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 5);
        $data = $this->dashboardService->getTopBorrowedCategories($limit > 0 ? $limit : 5);

        return ApiResponse::successResponse('Data kategori teratas peminjaman berhasil diambil', $data);
    }

    public function topBorrowedBooks(\Illuminate\Http\Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 5);
        $data = $this->dashboardService->getTopBorrowedBooks($limit > 0 ? $limit : 5);

        return ApiResponse::successResponse('Data buku teratas peminjaman berhasil diambil', $data);
    }

    public function loanMonthlyChart(\Illuminate\Http\Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);
        $data = $this->dashboardService->getLoanMonthlyChart((int)$year);

        return ApiResponse::successResponse('Data grafik peminjaman bulanan', $data);
    }

    public function loanStatusChart(\Illuminate\Http\Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);
        $month = $request->query('month', now()->month);
        $data = $this->dashboardService->getLoanStatusChart((int)$year, (int)$month);

        return ApiResponse::successResponse('Data grafik status peminjaman', $data);
    }

    public function calendar(\Illuminate\Http\Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);
        $month = $request->query('month', now()->month);

        $data = $this->dashboardService->getCalendar((int)$year, (int)$month);

        return ApiResponse::successResponse('Data kalender peminjaman', $data);
    }

    public function dayDetail(\Illuminate\Http\Request $request): JsonResponse
    {
        $year  = $request->query('year', now()->year);
        $month = $request->query('month', now()->month);
        $day   = $request->query('day', now()->day);

        $data = $this->dashboardService->getDayDetail((int)$year, (int)$month, (int)$day);

        return ApiResponse::successResponse('Data detail tanggal', $data);
    }

    public function borrowComparisonChart(\Illuminate\Http\Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);
        $data = $this->dashboardService->getBorrowComparisonChart((int)$year);

        return ApiResponse::successResponse('Data grafik perbandingan peminjaman', $data);
    }

    public function loginRegisterTrendChart(\Illuminate\Http\Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);
        $data = $this->dashboardService->getLoginRegisterTrendChart((int)$year);

        return ApiResponse::successResponse('Data grafik tren login & registrasi', $data);
    }
}
