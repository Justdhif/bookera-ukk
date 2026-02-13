<?php

namespace App\Services\Activity;

use App\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityService
{
    public function getActivities(array $filters): array
    {
        $year = $filters['year'] ?? now()->year;

        $query = ActivityLog::query()
            ->with(['user.profile'])
            ->whereYear('created_at', $year)
            ->latest();

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (!empty($filters['search'])) {
            $query->where('description', 'like', "%{$filters['search']}%");
        }

        $activityLogs = $query->paginate($filters['per_page'] ?? 15);

        $availableYears = ActivityLog::selectRaw('DISTINCT YEAR(created_at) as year')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [now()->year];
        }

        $modules = ActivityLog::select('module')
            ->distinct()
            ->pluck('module');

        $monthlyData = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        for ($month = 1; $month <= 12; $month++) {
            $dataPoint = ['month' => $monthNames[$month - 1]];

            foreach ($modules as $module) {
                $count = ActivityLog::where('module', $module)
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month)
                    ->count();

                $dataPoint[$module] = $count;
            }

            $monthlyData[] = $dataPoint;
        }

        $todayCount = ActivityLog::whereDate('created_at', today())->count();

        $weekCount = ActivityLog::whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ])->count();

        $monthCount = ActivityLog::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return [
            'logs' => $activityLogs,
            'charts' => [
                'monthly' => $monthlyData,
                'modules' => $modules->toArray(),
                'current_year' => $year,
                'available_years' => $availableYears,
            ],
            'statistics' => [
                'today' => $todayCount,
                'this_week' => $weekCount,
                'this_month' => $monthCount,
                'total' => ActivityLog::count(),
            ],
        ];
    }

    public function getActivityById(int $id): ActivityLog
    {
        return ActivityLog::with(['user.profile', 'subject'])->findOrFail($id);
    }
}
