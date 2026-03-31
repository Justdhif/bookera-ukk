<?php

namespace App\Services\Phone;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PhoneService
{
    /**
     * Generate a random 6-digit OTP.
     */
    public function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP via Fonnte WhatsApp API.
     * Phone number should be in international format without leading '+', e.g. "6281234567890".
     */
    public function sendOtp(string $phoneNumber, string $otp): bool
    {
        $token = config('services.fonnte.token');

        if (empty($token)) {
            Log::error('Fonnte token is not configured.');
            return false;
        }

        $message = "Kode verifikasi Bookera Anda adalah: *{$otp}*\n\nKode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.";

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target'  => $phoneNumber,
                'message' => $message,
                'countryCode' => '62',
            ]);

            if ($response->successful()) {
                $body = $response->json();
                if (isset($body['status']) && $body['status'] === true) {
                    return true;
                }
                Log::warning('Fonnte API returned non-success status', ['body' => $body]);
                return false;
            }

            Log::error('Fonnte API request failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Fonnte API exception', ['message' => $e->getMessage()]);
            return false;
        }
    }
}
