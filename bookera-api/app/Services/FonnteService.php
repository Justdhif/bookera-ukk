<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    private string $token;

    private string $url;

    public function __construct()
    {
        $this->token = config('services.fonnte.token', env('FONNTE_TOKEN', ''));
        $this->url = config('services.fonnte.url', env('FONNTE_URL', 'https://api.fonnte.com/send'));
    }

    /**
     * Send a WhatsApp message via Fonnte.
     *
     * @param  string  $phone  Recipient phone number (e.g. "628123456789")
     * @param  string  $message  Message body
     */
    public function send(string $phone, string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('FonnteService: FONNTE_TOKEN is not configured.');

            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->asForm()->post($this->url, [
                'target' => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                $body = $response->json();
                if (isset($body['status']) && $body['status'] === false) {
                    Log::warning('FonnteService: Message not sent. Response: '.json_encode($body));

                    return false;
                }
                Log::info('FonnteService: Message sent successfully to '.$phone);

                return true;
            }

            Log::warning('FonnteService: HTTP error '.$response->status().'. Body: '.$response->body());

            return false;
        } catch (\Exception $e) {
            Log::error('FonnteService: Exception - '.$e->getMessage());

            return false;
        }
    }
}
