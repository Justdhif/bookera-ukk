<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\FonnteService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class SendReturnNotification
{
    public function __construct()
    {
    }

    public function handle($event)
    {
        $bookReturn = $event->bookReturn;
        $borrow     = $bookReturn->borrow;

        // Notifikasi saat user request return
        if ($event instanceof \App\Events\ReturnRequested) {

            $admins = User::where('role', 'admin')->pluck('id');

            $bookTitles = $bookReturn->details->map(function ($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $bookReturn->details->count();
            $moreText   = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Return Request',
                    "User {$borrow->user->profile->full_name} wants to return {$bookTitles}{$moreText} (Borrow #{$borrow->id})",
                    'return_request',
                    'return',
                    ['return_id' => $bookReturn->id, 'borrow_id' => $borrow->id]
                );
            }
        }

        // Notifikasi saat admin approve return
        if ($event instanceof \App\Events\ReturnApproved) {

            $userId  = $borrow->user_id;
            $user    = $borrow->user;
            $profile = $user?->profile;

            $bookTitles = $bookReturn->details->map(function ($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $bookReturn->details->count();
            $moreText   = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            NotificationService::send(
                $userId,
                'Return Completed',
                "Your return for {$bookTitles}{$moreText} has been processed successfully. Thank you!",
                'approved',
                'return',
                ['return_id' => $bookReturn->id, 'borrow_id' => $borrow->id]
            );

            if ($profile && $profile->notification_enabled && $profile->notification_whatsapp && $profile->phone_number) {
                $returnBookList = $bookReturn->details->map(function ($detail) {
                    return '  • ' . ($detail->bookCopy->book->title ?? 'Unknown');
                })->implode("\n");

                $message = "✅ *BOOKERA — Pengembalian Diterima!*\n"
                    . "━━━━━━━━━━━━━━━━━━━━\n\n"
                    . "Halo, *{$profile->full_name}*! 👋\n\n"
                    . "Pengembalian buku Anda telah berhasil *dikonfirmasi* oleh petugas perpustakaan.\n\n"
                    . "📋 *Detail Pengembalian:*\n"
                    . "  🔖 Kode Pinjam     : *" . $borrow->borrow_code . "*\n"
                    . "  📅 Tanggal Kembali : " . now()->format('d M Y') . "\n\n"
                    . "📚 *Buku yang Dikembalikan:*\n"
                    . $returnBookList . "\n\n"
                    . "━━━━━━━━━━━━━━━━━━━━\n"
                    . "🙏 Terima kasih telah mengembalikan buku!\n\n"
                    . "_Bookera — Perpustakaan Digital_";
                try {
                    (new FonnteService())->send($profile->phone_number, $message);
                } catch (\Exception $e) {
                    Log::error('Failed to send return approved WhatsApp: ' . $e->getMessage());
                }
            }
        }
    }
}
