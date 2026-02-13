<?php

namespace App\Services\Notification;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function getUserNotifications(User $user, ?string $filter = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Notification::where('user_id', $user->id)->latest();

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        return $query->paginate($perPage);
    }

    public function getNotificationById(User $user, Notification $notification): Notification
    {
        if ($notification->user_id !== $user->id) {
            throw new \Exception('Unauthorized access to notification');
        }

        return $notification;
    }

    public function markAsRead(User $user, Notification $notification): Notification
    {
        if ($notification->user_id !== $user->id) {
            throw new \Exception('Unauthorized access to notification');
        }

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return $notification;
    }

    public function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    public function deleteNotification(User $user, Notification $notification): void
    {
        if ($notification->user_id !== $user->id) {
            throw new \Exception('Unauthorized access to notification');
        }

        $notification->delete();
    }

    public function deleteAllRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNotNull('read_at')
            ->delete();
    }
}
