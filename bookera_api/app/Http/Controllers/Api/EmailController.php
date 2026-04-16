<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailChangeMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class EmailController extends Controller
{
    /**
     * Step 1: Request an email change.
     * Validates the new email, generates an OTP, caches it, and sends the OTP to the new email.
     */
    public function requestChange(Request $request): JsonResponse
    {
        $request->validate([
            'new_email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
        ]);

        /** @var User $user */
        $user = Auth::user();
        $newEmail = $request->new_email;

        if ($user->email === $newEmail) {
            return ApiResponse::errorResponse('The new email must be different from the current email.', null, 422);
        }

        // Generate 6-digit OTP
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Cache it for 5 minutes
        $cacheKey = "email_otp_{$user->id}";

        Cache::put($cacheKey, [
            'otp'       => $otp,
            'new_email' => $newEmail,
        ], now()->addMinutes(5));

        // Send OTP via Email
        try {
            Mail::to($newEmail)->send(new VerifyEmailChangeMail($otp, $newEmail));
        } catch (\Exception $e) {
            Cache::forget($cacheKey);
            return ApiResponse::errorResponse('Failed to send OTP to the new email. Make sure the email is valid: :message', [
                'message' => $e->getMessage(),
            ], 500);
        }

        return ApiResponse::successResponse('OTP has been sent to your new email address.', [
            'email_hint' => $this->maskEmail($newEmail),
        ]);
    }

    /**
     * Step 2: Verify OTP and update email address.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        /** @var User $user */
        $user = Auth::user();
        $cacheKey = "email_otp_{$user->id}";
        $cached = Cache::get($cacheKey);

        if (!$cached) {
            return ApiResponse::errorResponse('The OTP has expired or was not found. Please request a new OTP.', null, 422);
        }

        if ($cached['otp'] !== $request->otp) {
            return ApiResponse::errorResponse('The OTP code is invalid.', null, 422);
        }

        $newEmail = $cached['new_email'];

        // Ensure email is still unique
        if (User::where('email', $newEmail)->exists()) {
            return ApiResponse::errorResponse('This email is already registered to another account.', null, 422);
        }

        // Update email
        $user->update([
            'email' => $newEmail,
        ]);

        // Clear OTP from cache
        Cache::forget($cacheKey);

        $user->load('profile');

        return ApiResponse::successResponse('Email address updated successfully.', $user);
    }

    /**
     * Simple utility to mask part of the email address for the hint
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return $email;
        }

        $name = $parts[0];
        $domain = $parts[1];

        $maskedName = substr($name, 0, 2) . str_repeat('*', max(strlen($name) - 2, 0));
        return $maskedName . '@' . $domain;
    }
}
