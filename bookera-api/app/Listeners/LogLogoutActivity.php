<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use App\Helpers\ActivityLogger;
use App\Models\ActivityLog;

class LogLogoutActivity
{
    public function handle(Logout $event): void
    {
        // Cek apakah sudah ada log logout dalam 2 detik terakhir untuk user ini
        $exists = ActivityLog::where('user_id', $event->user->id)
            ->where('action', 'logout')
            ->where('module', 'auth')
            ->where('created_at', '>=', now()->subSeconds(2))
            ->exists();

        if ($exists) {
            return;
        }

        ActivityLogger::log(
            'logout',
            'auth',
            'User logout',
            null,
            null,
            $event->user
        );
    }
}
