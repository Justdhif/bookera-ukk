<?php

namespace App\Helpers;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ActivityLogger
{
    public static function log(
        string $action,
        string $module,
        string $description,
        array $newData = null,
        array $oldData = null,
        $subject = null
    ): void {
        $request = request();

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'module' => $module,
            'description' => $description,

            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,

            'old_data' => $oldData,
            'new_data' => $newData,

            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
