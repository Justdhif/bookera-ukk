<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->has('year') ? (int)$request->year : now()->year;

        $query = ActivityLog::query()
            ->with(['user.profile'])
            ->whereYear('created_at', $year)
            ->latest();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('module')) {
            $query->where('module', $request->module);
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->has('search')) {
            $query->where('description', 'like', "%{$request->search}%");
        }

        $activityLogs = $query->paginate($request->per_page ?? 15);

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

        return ApiResponse::successResponse(
            'Activity logs retrieved successfully',
            [
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
            ]
        );
    }

    public function show($id)
    {
        $activityLog = ActivityLog::with(['user.profile', 'subject'])
            ->findOrFail($id);

        return ApiResponse::successResponse(
            'Activity log detail retrieved successfully',
            $activityLog
        );
    }
}
