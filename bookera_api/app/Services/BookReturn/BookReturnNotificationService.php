<?php

namespace App\Services\BookReturn;

use App\Mail\BorrowNotificationMail;
use App\Models\Borrow;
use App\Services\BaseNotificationService;
use App\Services\FonnteService;
use App\Services\NotificationService as DatabaseNotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class BookReturnNotificationService extends BaseNotificationService
{
    public function notifyReturnProcessed(Borrow $borrow, array $summary): void
    {
        $borrow->loadMissing(['user.profile', 'fines.fineType']);

        $user = $borrow->user;
        $profile = $user?->profile;
        $userName = $profile?->full_name ?? $user->email ?? $this->t('Unknown User');

        $returned = $summary['returned'] ?? [];
        $lost = $summary['lost'] ?? [];
        $hasReturnedItems = ! empty($returned);
        $isLostOnlyReport = ! $hasReturnedItems && ! empty($lost);

        $bookSummaryList = [];
        $booksForMail = [];

        foreach ($returned as $item) {
            $conditionText = $item['condition'] === 'good' ? $this->t('Good') : $this->t('Damaged');
            $bookSummaryList[] = "  • {$item['book_title']} ({$conditionText})";
            $booksForMail[] = "{$item['book_title']} ({$conditionText})";
        }

        foreach ($lost as $item) {
            $bookSummaryList[] = '  • '.$item['book_title'].' ('.$this->t('Lost').')';
            $booksForMail[] = $item['book_title'].' ('.$this->t('Lost').')';
        }

        $titles = collect($booksForMail)->take(2)->implode(', ');
        $moreCount = max(0, count($booksForMail) - 2);
        $moreText = $moreCount > 0 ? $this->t(' and :count more', ['count' => $moreCount]) : '';

        $unpaidFines = $borrow->fines->where('status', 'unpaid');
        $totalFineAmount = $unpaidFines->sum('amount');
        $fineAmountFormatted = number_format($totalFineAmount, 0, ',', '.');

        $title = $isLostOnlyReport
            ? $this->t('Lost Book Reported')
            : $this->t('Book Return Completed');

        $message = $isLostOnlyReport
            ? $this->t('Your lost book report (:books) has been recorded. Total fines: Rp :amount.', [
                'books' => $titles.$moreText,
                'amount' => $fineAmountFormatted,
            ])
            : $this->t('Your book return (:books) has been completed. Total fines: Rp :amount.', [
                'books' => $titles.$moreText,
                'amount' => $fineAmountFormatted,
            ]);

        DatabaseNotificationService::send(
            $borrow->user_id,
            $title,
            $message,
            'return_processed',
            'borrow',
            [
                'borrow_id' => $borrow->id,
                'total_fine' => $totalFineAmount,
                'returned' => $returned,
                'lost' => $lost,
            ]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        $details = [
            $this->t('Borrow Code') => $borrow->borrow_code,
            $this->t('Process Date') => now()->format('d M Y'),
            $this->t('Total Fines') => 'Rp '.$fineAmountFormatted,
            $this->t('Status') => $isLostOnlyReport ? $this->t('Reported') : $this->t('Completed'),
        ];

        if ($hasReturnedItems && $profile->notification_email && ! empty($user->email)) {
            $this->runAfterResponse(
                function () use ($user, $message, $details, $booksForMail): void {
                    Mail::to($user->email)->send(new BorrowNotificationMail(
                        subjectLine: $this->t('Book Return Completed - Bookera'),
                        title: $this->t('Book Return Completed'),
                        bodyMessage: $message,
                        details: $details,
                        books: $booksForMail,
                        footerNote: $this->t('Please check the return and fine details in the Bookera app.'),
                    ));
                },
                'Failed to send consolidated return email',
                ['recipient_id' => $user->id, 'borrow_id' => $borrow->id]
            );
        }

        if ($hasReturnedItems && $profile->notification_whatsapp && $profile->phone_number) {
            $fineList = $unpaidFines->map(function ($f) {
                return '  • '.($f->fineType->name ?? $this->t('Fine')).': *Rp '.number_format($f->amount, 0, ',', '.').'*';
            })->implode("\n");

            $fineSection = $totalFineAmount > 0
                ? "\n".$this->t('💰 *Fine Information:*')."\n" . $fineList . "\n  ━━━━━━━━━━━━━━\n  *".$this->t('Total Amount').": Rp {$fineAmountFormatted}*\n"
                : "\n".$this->t('✅ *No additional fines.*')."\n";

            $whatsappMessage = $this->t("✅ *BOOKERA — Return Notification*\n")
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                .$this->t('Hello, *:name*! 👋', ['name' => $userName])."\n\n"
                .$this->t('Your book return has been processed successfully.')."\n\n"
                .$this->t('📋 *Return Details:*')."\n"
                .$this->t('  🔖 Borrow Code : *:code*', ['code' => $borrow->borrow_code])."\n"
                .$this->t('  📅 Date     : :date', ['date' => now()->format('d M Y')])."\n\n"
                .$this->t('📚 *Book Status:*')."\n"
                .implode("\n", $bookSummaryList)."\n"
                .$fineSection."\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                .$this->t('Please make any fine payment at the library if applicable.')."\n\n"
                .$this->t('_Bookera — Perpustakaan Digital_');

            try {
                (new FonnteService)->send($profile->phone_number, $whatsappMessage);
            } catch (Throwable $exception) {
                Log::error('Failed to send consolidated return WhatsApp: '.$exception->getMessage());
            }
        }
    }
}
