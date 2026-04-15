<?php

namespace App\Services\BookReturn;

use App\Mail\BorrowNotificationMail;
use App\Models\Borrow;
use App\Models\User;
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
        $userName = $profile?->full_name ?? $user->email ?? 'Unknown User';

        $returned = $summary['returned'] ?? [];
        $lost = $summary['lost'] ?? [];

        $bookSummaryList = [];
        $booksForMail = [];

        foreach ($returned as $item) {
            $conditionText = $item['condition'] === 'good' ? 'Baik' : 'Rusak';
            $bookSummaryList[] = "  • {$item['book_title']} ({$conditionText})";
            $booksForMail[] = "{$item['book_title']} ({$conditionText})";
        }

        foreach ($lost as $item) {
            $bookSummaryList[] = "  • {$item['book_title']} (Hilang)";
            $booksForMail[] = "{$item['book_title']} (Hilang)";
        }

        // Summary for brief message
        $titles = collect($booksForMail)->take(2)->implode(', ');
        $moreCount = count($booksForMail) - 2;
        $moreText = $moreCount > 0 ? " and {$moreCount} more" : "";
        
        $unpaidFines = $borrow->fines->where('status', 'unpaid');
        $totalFineAmount = $unpaidFines->sum('amount');
        $fineAmountFormatted = number_format($totalFineAmount, 0, ',', '.');

        $message = "Pengembalian buku Anda ({$titles}{$moreText}) telah diproses. Total denda: Rp {$fineAmountFormatted}.";

        DatabaseNotificationService::send(
            $borrow->user_id,
            'Pengembalian Buku Diproses',
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
            'Borrow Code' => $borrow->borrow_code,
            'Process Date' => now()->format('d M Y'),
            'Total Fines' => 'Rp '.$fineAmountFormatted,
            'Status' => 'Diterima',
        ];

        if ($profile->notification_email && ! empty($user->email)) {
            $this->runAfterResponse(
                function () use ($user, $message, $details, $booksForMail): void {
                    Mail::to($user->email)->send(new BorrowNotificationMail(
                        subjectLine: 'Return Processed - Bookera',
                        title: 'Pengembalian Buku Diproses',
                        bodyMessage: $message,
                        details: $details,
                        books: $booksForMail,
                        footerNote: 'Silakan cek detail pengembalian dan denda di aplikasi Bookera.',
                    ));
                },
                'Failed to send consolidated return email',
                ['recipient_id' => $user->id, 'borrow_id' => $borrow->id]
            );
        }

        if ($profile->notification_whatsapp && $profile->phone_number) {
            $fineList = $unpaidFines->map(function ($f) {
                return '  • '.($f->fineType->name ?? 'Denda').': *Rp '.number_format($f->amount, 0, ',', '.').'*';
            })->implode("\n");

            $fineSection = $totalFineAmount > 0 
                ? "\n💰 *Informasi Denda:*\n" . $fineList . "\n  ━━━━━━━━━━━━━━\n  *Total Tagihan: Rp {$fineAmountFormatted}*\n"
                : "\n✅ *Tidak ada denda tambahan.*\n";

            $whatsappMessage = "✅ *BOOKERA — Notifikasi Pengembalian*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$userName}*! 👋\n\n"
                ."Proses pengembalian buku Anda telah berhasil diproses.\n\n"
                ."📋 *Detail Pengembalian:*\n"
                .'  🔖 Kode Pinjam : *'.$borrow->borrow_code."*\n"
                .'  📅 Tanggal     : '.now()->format('d M Y')."\n\n"
                ."📚 *Status Buku:*\n"
                .implode("\n", $bookSummaryList)."\n"
                .$fineSection."\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."Silakan lakukan pembayaran denda di perpustakaan jika ada.\n\n"
                .'_Bookera — Perpustakaan Digital_';

            try {
                (new FonnteService)->send($profile->phone_number, $whatsappMessage);
            } catch (Throwable $exception) {
                Log::error('Failed to send consolidated return WhatsApp: '.$exception->getMessage());
            }
        }
    }
}
