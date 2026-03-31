<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaService
{
    private string $secretKey;
    private float $minScore;

    public function __construct()
    {
        $this->secretKey = config('services.recaptcha.secret_key');
        $this->minScore  = config('services.recaptcha.min_score', 0.5);
    }

    /**
     * Verify a reCAPTCHA v2 token against Google's siteverify API.
     * Returns true when verification passes, false otherwise.
     */
    public function verify(?string $token): bool
    {
        if (empty($token)) {
            return false;
        }

        try {
            $response = Http::asForm()->post(
                'https://www.google.com/recaptcha/api/siteverify',
                [
                    'secret'   => $this->secretKey,
                    'response' => $token,
                ]
            );

            $result = $response->json();

            Log::debug('reCAPTCHA result', $result);

            return (bool)($result['success'] ?? false);
        } catch (\Throwable $e) {
            Log::error('reCAPTCHA verification failed: ' . $e->getMessage());
            return false;
        }
    }
}
