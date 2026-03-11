<?php

namespace App\Listeners;

use App\Events\FineCreated;
use App\Services\FonnteService;
use App\Services\NotificationService;

class SendFineNotification
{
    public function __construct()
    {
    }

    public function handle(FineCreated $event)
    {
        $fine   = $event->fine;
        $borrow = $fine->borrow;
        $userId = $borrow->user_id;
        $user   = $borrow->user;
        $profile = $user?->profile;

        $bookTitles = $borrow->borrowDetails->map(function ($detail) {
            return $detail->bookCopy->book->title ?? 'Unknown';
        })->take(2)->implode(', ');

        $totalBooks = $borrow->borrowDetails->count();
        $moreText   = $totalBooks > 2 ? ' dan ' . ($totalBooks - 2) . ' lainnya' : '';

        $fineTypeName = $fine->fineType->name ?? 'Denda';
        $amount       = number_format($fine->amount, 0, ',', '.');

        NotificationService::send(
            $userId,
            'Denda Baru Dikenakan',
            "Denda sebesar Rp {$amount} telah dikenakan untuk buku {$bookTitles}{$moreText} ({$fineTypeName}). Cek halaman Denda Saya.",
            'fine_created',
            'fine',
            ['fine_id' => $fine->id, 'borrow_id' => $borrow->id]
        );

        if ($profile && $profile->notification_enabled && $profile->notification_whatsapp && $profile->phone_number) {
            $fineBookList = $borrow->borrowDetails->map(function ($detail) {
                return '  • ' . ($detail->bookCopy->book->title ?? 'Unknown');
            })->take(2)->implode("\n") . ($moreText ? "\n  {$moreText}" : '');

            $message = "💰 *BOOKERA — Notifikasi Denda*\n"
                . "━━━━━━━━━━━━━━━━━━━━\n\n"
                . "Halo, *{$profile->full_name}*! 👋\n\n"
                . "Denda baru telah dikenakan pada akun Anda.\n\n"
                . "📋 *Detail Denda:*\n"
                . "  🔖 Kode Pinjam : *" . $borrow->borrow_code . "*\n"
                . "  ⚠️ Jenis Denda  : " . $fineTypeName . "\n"
                . "  💵 Jumlah Denda : *Rp " . $amount . "*\n\n"
                . "📚 *Buku Terkait:*\n"
                . $fineBookList . "\n\n"
                . "━━━━━━━━━━━━━━━━━━━━\n"
                . "📲 Cek detail denda di aplikasi Bookera.\n\n"
                . "_Bookera — Perpustakaan Digital_";
            try {
                (new FonnteService())->send($profile->phone_number, $message);
            } catch (\Exception $e) {
                \Log::error('Failed to send fine WhatsApp: ' . $e->getMessage());
            }
        }
    }
}

