<?php

namespace App\Services;

use App\Services\FonnteService;
use App\Services\NotificationService as DatabaseNotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

abstract class BaseNotificationService
{
    protected function dispatchNotification(
        object $recipient,
        string $title,
        string $message,
        string $type,
        string $module,
        array $data,
        ?callable $mailFactory = null,
        ?string $whatsappMessage = null,
        bool $sendMail = true,
        bool $sendWhatsApp = true
    ): void {
        DatabaseNotificationService::send(
            $recipient->id,
            $title,
            $message,
            $type,
            $module,
            $data
        );

        $profile = $recipient?->profile;

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($sendMail && $profile->notification_email && $mailFactory && ! empty($recipient->email)) {
            $this->runAfterResponse(
                function () use ($recipient, $mailFactory): void {
                    Mail::to($recipient->email)->send($mailFactory());
                },
                'Failed to send email notification',
                [
                    'recipient_id' => $recipient->id,
                    'title'       => $title,
                ]
            );
        }

        if ($sendWhatsApp && $profile->notification_whatsapp && $profile->phone_number && $whatsappMessage) {
            $this->runAfterResponse(
                function () use ($profile, $recipient, $title, $whatsappMessage): void {
                    try {
                        (new FonnteService)->send($profile->phone_number, $whatsappMessage);
                    } catch (Throwable $exception) {
                        Log::error('Failed to send WhatsApp notification: ' . $exception->getMessage(), [
                            'recipient_id' => $recipient->id,
                            'title'       => $title,
                        ]);
                    }
                },
                'Failed to send WhatsApp notification',
                ['recipient_id' => $recipient->id, 'title' => $title]
            );
        }
    }

    protected function runAfterResponse(callable $callback, string $logMessage, array $context = []): void
    {
        app()->terminating(function () use ($callback, $logMessage, $context): void {
            try {
                $callback();
            } catch (Throwable $exception) {
                Log::error($logMessage . ': ' . $exception->getMessage(), $context + [
                    'exception' => $exception,
                ]);
            }
        });
    }

    /**
     * @return array{0:string,1:string,2:array<int, string>}
     */
    protected function summarizeBooks($details, callable $titleResolver): array
    {
        $details = collect($details);

        $bookTitles = $details->take(2)->map($titleResolver)->implode(', ');
        $totalBooks = $details->count();
        $moreText = $totalBooks > 2 ? ' and '.($totalBooks - 2).' more' : '';
        $books = $details->map($titleResolver)->values()->all();

        return [$bookTitles, $moreText, $books];
    }
}
