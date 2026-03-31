<?php

namespace App\Listeners;

use App\Helpers\ActivityLogger;
use App\Models\ActivityLog;
use Illuminate\Auth\Events\Login;

class LogLoginActivity
{
    public function handle(Login $event): void
    {
        // Cek apakah sudah ada log login dalam 2 detik terakhir untuk user ini
        $exists = ActivityLog::where('user_id', $event->user->id)
            ->where('action', 'login')
            ->where('module', 'auth')
            ->where('created_at', '>=', now()->subSeconds(2))
            ->exists();

        if ($exists) {
            return;
        }

        ActivityLogger::log(
            'login',
            'auth',
            'User login',
            null,
            null,
            $event->user
        );
    }
}
