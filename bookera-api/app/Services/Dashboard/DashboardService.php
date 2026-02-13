<?php

namespace App\Services\Dashboard;

use App\Models\Book;
use App\Models\BookReturn;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getTotals(): array
    {
        return [
            'total_users' => User::count(),
            'total_books' => Book::count(),
            'loans_today' => Loan::whereDate('loan_date', today())->count(),
            'returns_today' => BookReturn::whereDate('return_date', today())->count(),
        ];
    }

    public function getLoanMonthlyChart(): mixed
    {
        return Loan::select(
            DB::raw('MONTH(loan_date) as month'),
            DB::raw('COUNT(*) as total')
        )
            ->whereYear('loan_date', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    public function getLoanStatusChart(): mixed
    {
        return Loan::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get();
    }

    public function getLatestLoans(): mixed
    {
        return Loan::with([
            'user.profile',
            'loanDetails.bookCopy.book'
        ])
            ->latest()
            ->limit(5)
            ->get();
    }
}
