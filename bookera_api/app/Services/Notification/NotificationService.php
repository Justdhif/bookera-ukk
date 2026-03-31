<?php

namespace App\Services\Notification;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function getAll(User $user, ?string $filter = null, int $perPage = 15, ?string $module = null): LengthAwarePaginator
    {
        $query = Notification::where('user_id', $user->id)->latest()->orderByDesc('id');

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        if ($module !== null) {
            $query->where('module', $module);
        }

        return $query->paginate($perPage);
    }

    public function getById(User $user, Notification $notification): Notification
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

    public function markAllAsRead(User $user, ?string $module = null): int
    {
        $query = Notification::where('user_id', $user->id)
            ->whereNull('read_at');

        if ($module !== null) {
            $query->where('module', $module);
        }

        return $query->update(['read_at' => now()]);
    }

    public function getUnreadCount(User $user, ?string $module = null): int
    {
        $query = Notification::where('user_id', $user->id)
            ->whereNull('read_at');

        if ($module !== null) {
            $query->where('module', $module);
        }

        return $query->count();
    }

    public function delete(User $user, Notification $notification): void
    {
        if ($notification->user_id !== $user->id) {
            throw new \Exception('Unauthorized access to notification');
        }

        $notification->delete();
    }

    public function deleteAllRead(User $user, ?string $module = null): int
    {
        $query = Notification::where('user_id', $user->id)
            ->whereNotNull('read_at');

        if ($module !== null) {
            $query->where('module', $module);
        }

        return $query->delete();
    }
}
