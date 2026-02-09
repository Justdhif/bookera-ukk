<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public static function send(
        int $userId,
        string $title,
        ?string $message = null,
        ?string $type = null,
        ?string $module = null,
        array $data = []
    ) {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'module' => $module,
            'data' => $data
        ]);
    }
}
