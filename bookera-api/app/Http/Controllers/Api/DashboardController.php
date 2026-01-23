<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\{
    User,
    Book,
    Loan,
    BookReturn
};
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | TOTAL CARD
    |--------------------------------------------------------------------------
    */
    public function totals()
    {
        $data = [
            'total_users' => User::count(),
            'total_books' => Book::count(),
            'loans_today' => Loan::whereDate('loan_date', today())->count(),
            'returns_today' => BookReturn::whereDate('return_date', today())->count(),
        ];

        return ApiResponse::successResponse(
            'Data total dashboard berhasil diambil',
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LOANS - LINE & BAR CHART (PER MONTH)
    |--------------------------------------------------------------------------
    */
    public function loanMonthlyChart()
    {
        $data = Loan::select(
            DB::raw('MONTH(loan_date) as month'),
            DB::raw('COUNT(*) as total')
        )
            ->whereYear('loan_date', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return ApiResponse::successResponse(
            'Data grafik peminjaman bulanan',
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LOANS - PIE CHART (STATUS)
    |--------------------------------------------------------------------------
    */
    public function loanStatusChart()
    {
        $data = Loan::select(
            'status',
            DB::raw('COUNT(*) as total')
        )
            ->groupBy('status')
            ->get();

        return ApiResponse::successResponse(
            'Data grafik status peminjaman',
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LATEST DATA (HIGHLIGHT)
    |--------------------------------------------------------------------------
    */
    public function latest()
    {
        $data = [
            'users' => User::latest()->limit(5)->get(),
            'books' => Book::latest()->limit(5)->get(),
            'loans' => Loan::with('user')
                ->latest()
                ->limit(5)
                ->get(),
        ];

        return ApiResponse::successResponse(
            'Data terbaru dashboard',
            $data
        );
    }
}
