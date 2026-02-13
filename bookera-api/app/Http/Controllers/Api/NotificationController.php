<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\Notification\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getUserNotifications(
            $request->user(),
            $request->get('filter'),
            $request->get('per_page', 15)
        );

        return ApiResponse::successResponse('Notifications retrieved successfully', $notifications);
    }

    public function show(Request $request, Notification $notification): JsonResponse
    {
        try {
            $notification = $this->notificationService->getNotificationById($request->user(), $notification);

            return ApiResponse::successResponse('Notification retrieved successfully', $notification);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 403);
        }
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        try {
            $notification = $this->notificationService->markAsRead($request->user(), $notification);

            return ApiResponse::successResponse('Notification marked as read', $notification);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 403);
        }
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $updated = $this->notificationService->markAllAsRead($request->user());

        return ApiResponse::successResponse('All notifications marked as read', ['updated_count' => $updated]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount($request->user());

        return ApiResponse::successResponse('Unread count retrieved successfully', ['unread_count' => $count]);
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        try {
            $this->notificationService->deleteNotification($request->user(), $notification);

            return ApiResponse::successResponse('Notification deleted successfully', null);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 403);
        }
    }

    public function deleteAllRead(Request $request): JsonResponse
    {
        $deleted = $this->notificationService->deleteAllRead($request->user());

        return ApiResponse::successResponse('All read notifications deleted', ['deleted_count' => $deleted]);
    }
}

