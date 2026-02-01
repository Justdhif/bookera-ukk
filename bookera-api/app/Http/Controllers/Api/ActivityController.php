<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    /**
     * GET LIST ACTIVITY LOGS (WITH FILTERS & CHART DATA)
     */
    public function index(Request $request)
    {
        // Query activity logs dengan relasi user
        $query = ActivityLog::query()
            ->with(['user.profile'])
            ->latest();

        // Filter berdasarkan user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter berdasarkan action (login, logout, create, update, delete, dll)
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter berdasarkan module (auth, book, loan, user, dll)
        if ($request->has('module')) {
            $query->where('module', $request->module);
        }

        // Filter berdasarkan date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search di description
        if ($request->has('search')) {
            $query->where('description', 'like', "%{$request->search}%");
        }

        // Pagination
        $activityLogs = $query->paginate($request->per_page ?? 15);

        // Data untuk chart - Activity by module (pie/donut chart)
        $activityByModule = ActivityLog::select('module', DB::raw('COUNT(*) as count'))
            ->groupBy('module')
            ->orderByDesc('count')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst($item->module),
                    'value' => $item->count,
                ];
            });

        // Data untuk chart - Activity by action (bar chart)
        $activityByAction = ActivityLog::select('action', DB::raw('COUNT(*) as count'))
            ->groupBy('action')
            ->orderByDesc('count')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst($item->action),
                    'value' => $item->count,
                ];
            });

        // Data untuk chart - Daily activity (7 hari terakhir untuk line chart)
        $dailyActivity = ActivityLog::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        // Total aktivitas hari ini
        $todayCount = ActivityLog::whereDate('created_at', today())->count();

        // Total aktivitas minggu ini
        $weekCount = ActivityLog::whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ])->count();

        // Total aktivitas bulan ini
        $monthCount = ActivityLog::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return ApiResponse::successResponse(
            'Activity logs retrieved successfully',
            [
                'logs' => $activityLogs,
                'charts' => [
                    'by_module' => $activityByModule,
                    'by_action' => $activityByAction,
                    'daily' => $dailyActivity,
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

    /**
     * GET DETAIL ACTIVITY LOG
     */
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
