<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Phone\PhoneService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class PhoneController extends Controller
{
    private PhoneService $phoneService;

    public function __construct(PhoneService $phoneService)
    {
        $this->phoneService = $phoneService;
    }

    /**
     * Step 1: Request a phone number change.
     * Validates the new phone number, sends OTP via WhatsApp, caches the OTP.
     */
    public function requestChange(Request $request): JsonResponse
    {
        $request->validate([
            'new_phone' => ['required', 'string', 'regex:/^[0-9]{7,15}$/'],
        ]);

        /** @var User $user */
        $user = Auth::user();
        $newPhone = $request->new_phone;

        // Generate OTP and cache it for 5 minutes
        $otp = $this->phoneService->generateOtp();
        $cacheKey = "phone_otp_{$user->id}";

        Cache::put($cacheKey, [
            'otp'       => $otp,
            'new_phone' => $newPhone,
        ], now()->addMinutes(5));

        // Send OTP via Fonnte
        $sent = $this->phoneService->sendOtp($newPhone, $otp);

        if (!$sent) {
            Cache::forget($cacheKey);
            return ApiResponse::errorResponse('Gagal mengirim OTP. Pastikan nomor WhatsApp valid dan coba lagi.', null, 500);
        }

        return ApiResponse::successResponse('OTP berhasil dikirim ke nomor WhatsApp baru Anda.', [
            'phone_hint' => '***' . substr($newPhone, -4),
        ]);
    }

    /**
     * Step 2: Verify OTP and update phone number.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        /** @var User $user */
        $user = Auth::user();
        $cacheKey = "phone_otp_{$user->id}";
        $cached = Cache::get($cacheKey);

        if (!$cached) {
            return ApiResponse::errorResponse('OTP sudah kadaluarsa atau tidak ditemukan. Silakan minta OTP baru.', null, 422);
        }

        if ($cached['otp'] !== $request->otp) {
            return ApiResponse::errorResponse('Kode OTP tidak valid.', null, 422);
        }

        // Update phone number
        $user->profile()->update([
            'phone_number' => $cached['new_phone'],
        ]);

        // Clear OTP from cache
        Cache::forget($cacheKey);

        $user->load('profile');

        return ApiResponse::successResponse('Nomor telepon berhasil diperbarui.', $user);
    }
}
