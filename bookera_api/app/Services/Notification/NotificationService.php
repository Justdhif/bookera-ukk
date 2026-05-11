<?php

namespace App\Services\Notification;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Notifications\DatabaseNotification as Notification;

class NotificationService
{
    public function getAll(User $user, ?string $filter = null, int $perPage = 15, ?string $module = null): LengthAwarePaginator
    {
        $query = $user->notifications()->latest();

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        if ($module !== null) {
            $query->where('data->module', $module);
        }

        return $query->paginate($perPage)->through(fn($n) => $this->formatNotification($n));
    }

    public function getById(User $user, Notification $notification): array
    {
        if ($notification->notifiable_id !== $user->id || $notification->notifiable_type !== get_class($user)) {
            throw new \Exception('Unauthorized access to notification');
        }

        return $this->formatNotification($notification);
    }

    public function markAsRead(User $user, Notification $notification): array
    {
        if ($notification->notifiable_id !== $user->id || $notification->notifiable_type !== get_class($user)) {
            throw new \Exception('Unauthorized access to notification');
        }

        $notification->markAsRead();

        return $this->formatNotification($notification);
    }

    private function formatNotification(Notification $notification): array
    {
        $data = $notification->data;
        return [
            'id' => $notification->id,
            'title' => $data['title'] ?? null,
            'message' => $data['message'] ?? null,
            'type' => $data['type'] ?? null,
            'module' => $data['module'] ?? null,
            'data' => $data['extra_data'] ?? [],
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
        ];
    }

    public function markAllAsRead(User $user, ?string $module = null): int
    {
        $query = $user->unreadNotifications();

        if ($module !== null) {
            $query->where('data->module', $module);
        }

        return $query->update(['read_at' => now()]);
    }

    public function getUnreadCount(User $user, ?string $module = null): int
    {
        $query = $user->unreadNotifications();

        if ($module !== null) {
            $query->where('data->module', $module);
        }

        return $query->count();
    }

    public function delete(User $user, Notification $notification): void
    {
        if ($notification->notifiable_id !== $user->id || $notification->notifiable_type !== get_class($user)) {
            throw new \Exception('Unauthorized access to notification');
        }

        $notification->delete();
    }

    public function deleteAllRead(User $user, ?string $module = null): int
    {
        $query = $user->notifications()->whereNotNull('read_at');

        if ($module !== null) {
            $query->where('data->module', $module);
        }

        return $query->delete();
    }
}
