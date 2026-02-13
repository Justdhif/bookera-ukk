<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\Activity\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    private ActivityService $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'year' => $request->year,
            'user_id' => $request->user_id,
            'action' => $request->action,
            'module' => $request->module,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'search' => $request->search,
            'per_page' => $request->per_page,
        ];

        $data = $this->activityService->getActivities($filters);

        return ApiResponse::successResponse('Activity logs retrieved successfully', $data);
    }

    public function show(int $id): JsonResponse
    {
        $activityLog = $this->activityService->getActivityById($id);

        return ApiResponse::successResponse('Activity log detail retrieved successfully', $activityLog);
    }
}

