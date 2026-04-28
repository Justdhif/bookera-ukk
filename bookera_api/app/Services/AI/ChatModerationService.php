<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatModerationService
{
    private string $groqApiKey;
    private string $groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    private string $model = 'llama-3.1-8b-instant';

    public function __construct()
    {
        $this->groqApiKey = config('services.groq.key', env('GROQ_API_KEY', ''));
    }

    public function moderate(string $message, string $locale = 'id'): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->groqApiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(15)->post($this->groqBaseUrl, [
                'model'       => $this->model,
                'temperature' => 0.0,
                'max_tokens'  => 150,
                'messages'    => [
                    [
                        'role'    => 'system',
                        'content' => AISystemPrompt::getModerationPrompt($locale),
                    ],

                    [
                        'role'    => 'user',
                        'content' => $message,
                    ],
                ],
            ]);

            if ($response->failed()) {
                Log::warning('Groq moderation API failed', ['body' => $response->body()]);
                return ['is_inappropriate' => false, 'reason' => ''];
            }

            $data    = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';

            return $this->parseResponse($content);
        } catch (\Throwable $e) {
            Log::error('Chat moderation error', ['error' => $e->getMessage()]);
            return ['is_inappropriate' => false, 'reason' => ''];
        }
    }

    private function parseResponse(string $content): array
    {
        $content = trim($content);
        
        $decoded = json_decode($content, true);
        if ($decoded !== null && isset($decoded['inappropriate'])) {
            return [
                'is_inappropriate' => (bool) $decoded['inappropriate'],
                'reason'           => $decoded['reason'] ?? '',
            ];
        }

        if (preg_match('/\{[^}]+\}/s', $content, $matches)) {
            $decoded = json_decode($matches[0], true);
            if ($decoded !== null && isset($decoded['inappropriate'])) {
                return [
                    'is_inappropriate' => (bool) $decoded['inappropriate'],
                    'reason'           => $decoded['reason'] ?? '',
                ];
            }
        }

        // Fallback: if we can't parse, allow the message
        Log::warning('Could not parse moderation response', ['content' => $content]);
        return ['is_inappropriate' => false, 'reason' => ''];
    }
}
