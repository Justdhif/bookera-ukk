<?php

namespace App\Services\Dashboard;

use App\Models\Book;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getTotals(): array
    {
        return [
            'total_users' => User::count(),
            'total_books' => Book::count(),
            'loans_today'    => Borrow::whereDate('borrow_date', today())->count(),
            'returns_today' => BookReturn::whereDate('return_date', today())->count(),
        ];
    }

    public function getLoanMonthlyChart(): mixed
    {
        return Borrow::select(
            DB::raw('MONTH(borrow_date) as month'),
            DB::raw('COUNT(*) as total')
        )
            ->whereYear('borrow_date', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    public function getLoanStatusChart(): mixed
    {
        return Borrow::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get();
    }

    public function getLatestLoans(): mixed
    {
        return Borrow::with([
            'user.profile',
            'borrowDetails.bookCopy.book',
        ])
            ->latest()
            ->limit(5)
            ->get();
    }
}
