<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $perPage = $request->get('per_page', 15);
        $filter = $request->get('filter'); // 'read' or 'unread'

        $query = Notification::where('user_id', $user->id)
            ->latest();

        // Filter by read/unread
        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        $notifications = $query->paginate($perPage);

        return ApiResponse::successResponse(
            'Notifications retrieved successfully',
            $notifications
        );
    }

    /**
     * Display the specified notification
     */
    public function show(Request $request, Notification $notification)
    {
        $user = $request->user();

        // Make sure the notification belongs to the authenticated user
        if ($notification->user_id !== $user->id) {
            return ApiResponse::errorResponse(
                'Unauthorized access to notification',
                null,
                403
            );
        }

        return ApiResponse::successResponse(
            'Notification retrieved successfully',
            $notification
        );
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();

        // Make sure the notification belongs to the authenticated user
        if ($notification->user_id !== $user->id) {
            return ApiResponse::errorResponse(
                'Unauthorized access to notification',
                null,
                403
            );
        }

        if ($notification->read_at === null) {
            $notification->update([
                'read_at' => now()
            ]);
        }

        return ApiResponse::successResponse(
            'Notification marked as read',
            $notification
        );
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $updated = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return ApiResponse::successResponse(
            'All notifications marked as read',
            ['updated_count' => $updated]
        );
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return ApiResponse::successResponse(
            'Unread count retrieved successfully',
            ['unread_count' => $count]
        );
    }

    /**
     * Delete notification
     */
    public function destroy(Request $request, Notification $notification)
    {
        $user = $request->user();

        // Make sure the notification belongs to the authenticated user
        if ($notification->user_id !== $user->id) {
            return ApiResponse::errorResponse(
                'Unauthorized access to notification',
                null,
                403
            );
        }

        $notification->delete();

        return ApiResponse::successResponse(
            'Notification deleted successfully',
            null
        );
    }

    /**
     * Delete all read notifications
     */
    public function deleteAllRead(Request $request)
    {
        $user = $request->user();

        $deleted = Notification::where('user_id', $user->id)
            ->whereNotNull('read_at')
            ->delete();

        return ApiResponse::successResponse(
            'All read notifications deleted',
            ['deleted_count' => $deleted]
        );
    }
}
