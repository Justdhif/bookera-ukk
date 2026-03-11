<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationSettingsController extends Controller
{
    /**
     * Get current notification settings for the authenticated user.
     */
    public function show(): JsonResponse
    {
        $user = Auth::user()->load('profile');

        $profile = $user->profile;

        if (!$profile) {
            return ApiResponse::errorResponse('Profil pengguna tidak ditemukan', 404);
        }

        return ApiResponse::successResponse('Pengaturan notifikasi berhasil diambil', [
            'notification_enabled'    => (bool) $profile->notification_enabled,
            'notification_email'      => (bool) $profile->notification_email,
            'notification_whatsapp'   => (bool) $profile->notification_whatsapp,
        ]);
    }

    /**
     * Update notification settings for the authenticated user.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notification_enabled'  => 'required|boolean',
            'notification_email'    => 'required|boolean',
            'notification_whatsapp' => 'required|boolean',
        ]);

        $user    = Auth::user()->load('profile');
        $profile = $user->profile;

        if (!$profile) {
            return ApiResponse::errorResponse('Profil pengguna tidak ditemukan', 404);
        }

        $profile->update([
            'notification_enabled'  => $validated['notification_enabled'],
            'notification_email'    => $validated['notification_email'],
            'notification_whatsapp' => $validated['notification_whatsapp'],
        ]);

        return ApiResponse::successResponse('Pengaturan notifikasi berhasil diperbarui', [
            'notification_enabled'    => (bool) $profile->notification_enabled,
            'notification_email'      => (bool) $profile->notification_email,
            'notification_whatsapp'   => (bool) $profile->notification_whatsapp,
        ]);
    }
}
