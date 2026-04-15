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
            'total_categories' => \App\Models\Category::count(),
            'total_authors' => \App\Models\Author::count(),
            'total_publishers' => \App\Models\Publisher::count(),
            'total_fines' => \App\Models\Fine::sum('amount'),
            'loans_today' => Borrow::whereDate('borrow_date', today())->count(),
            'returns_today' => BookReturn::whereDate('return_date', today())->count(),
        ];
    }

    public function getLoanMonthlyChart(int $year): mixed
    {
        return Borrow::select(
            DB::raw('MONTH(borrow_date) as month'),
            DB::raw('SUM(CASE WHEN status = "open" THEN 1 ELSE 0 END) as open_borrows'),
            DB::raw('SUM(CASE WHEN status = "close" THEN 1 ELSE 0 END) as close_borrows')
        )
            ->whereYear('borrow_date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    public function getLoanStatusChart(int $year, int $month): mixed
    {
        return Borrow::select('status', DB::raw('COUNT(*) as total'))
            ->whereYear('borrow_date', $year)
            ->whereMonth('borrow_date', $month)
            ->groupBy('status')
            ->get();
    }

    public function getCalendar(int $year, int $month): mixed
    {
        return Borrow::select(
            DB::raw('DAY(borrow_date) as date'),
            DB::raw('SUM(CASE WHEN status = "open" THEN 1 ELSE 0 END) as open_borrows'),
            DB::raw('SUM(CASE WHEN status = "close" THEN 1 ELSE 0 END) as close_borrows')
        )
            ->whereYear('borrow_date', $year)
            ->whereMonth('borrow_date', $month)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getDayDetail(int $year, int $month, int $day): array
    {
        $date = \Carbon\Carbon::create($year, $month, $day)->toDateString();

        $openCount = Borrow::whereDate('borrow_date', $date)->where('status', 'open')->count();
        $closeCount = Borrow::whereDate('borrow_date', $date)->where('status', 'close')->count();

        $borrows = Borrow::with(['user.profile'])
            ->whereDate('borrow_date', $date)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($borrow) {
                return [
                    'id'          => $borrow->id,
                    'borrow_code' => $borrow->borrow_code,
                    'status'      => $borrow->status,
                    'user'        => [
                        'id'        => $borrow->user?->id,
                        'email'     => $borrow->user?->email,
                        'full_name' => $borrow->user?->profile?->full_name ?? $borrow->user?->email,
                        'avatar'    => $borrow->user?->profile?->avatar ?? null,
                    ],
                ];
            });

        return [
            'date'         => $date,
            'open_borrows' => $openCount,
            'close_borrows' => $closeCount,
            'total'        => $openCount + $closeCount,
            'borrows'      => $borrows,
        ];
    }

    public function getBorrowComparisonChart(int $year): mixed
    {
        $borrows = DB::table('borrows')
            ->select(DB::raw('MONTH(borrow_date) as month'), DB::raw('COUNT(*) as total'))
            ->whereYear('borrow_date', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $requests = DB::table('borrow_requests')
            ->select(DB::raw('MONTH(created_at) as month'), DB::raw('COUNT(*) as total'))
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $data = [];
        for ($i = 1; $i <= 12; $i++) {
            $data[] = [
                'month' => $i,
                'total_borrows' => $borrows->get($i)->total ?? 0,
                'total_requests' => $requests->get($i)->total ?? 0,
            ];
        }

        return $data;
    }

    public function getLoginRegisterTrendChart(int $year): mixed
    {
        return DB::table('activity_logs')
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(CASE WHEN action = "login" THEN 1 ELSE 0 END) as login_count'),
                DB::raw('SUM(CASE WHEN action = "register" THEN 1 ELSE 0 END) as register_count')
            )
            ->where('module', 'Auth')
            ->whereIn('action', ['login', 'register'])
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }
}
