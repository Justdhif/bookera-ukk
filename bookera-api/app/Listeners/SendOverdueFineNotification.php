<?php

namespace App\Listeners;

use App\Events\BorrowOverdue;
use App\Services\FonnteService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendOverdueFineNotification
{
    public function __construct() {}

    public function handle(BorrowOverdue $event): void
    {
        $borrow = $event->borrow;
        $fine = $event->fine;
        $userId = $borrow->user_id;
        $user = $borrow->user;
        $profile = $user?->profile;

        $bookTitles = $borrow->borrowDetails
            ->map(fn ($detail) => $detail->bookCopy->book->title ?? 'Unknown')
            ->take(2)
            ->implode(', ');

        $totalBooks = $borrow->borrowDetails->count();
        $moreText = $totalBooks > 2 ? ' dan '.($totalBooks - 2).' lainnya' : '';

        $amount = number_format($fine->amount, 0, ',', '.');
        $dueDate = Carbon::parse($borrow->return_date)->format('d M Y');

        NotificationService::send(
            $userId,
            'Peminjaman Telat - Denda Otomatis',
            "Peminjaman buku \"{$bookTitles}{$moreText}\" melewati batas waktu ({$dueDate}). Denda keterlambatan sebesar Rp {$amount} telah dikenakan.",
            'borrow_overdue',
            'fine',
            [
                'borrow_id' => $borrow->id,
                'fine_id' => $fine->id,
                'amount' => $fine->amount,
                'due_date' => $borrow->return_date,
            ]
        );

        if ($profile && $profile->notification_enabled && $profile->notification_whatsapp && $profile->phone_number) {
            $daysLate = (int) Carbon::now()->diffInDays(Carbon::parse($borrow->return_date));
            $overdueBookList = $borrow->borrowDetails
                ->map(fn ($detail) => '  • '.($detail->bookCopy->book->title ?? 'Unknown'))
                ->take(2)
                ->implode("\n").($moreText ? "\n  {$moreText}" : '');

            $message = "🚨 *BOOKERA — Peminjaman Terlambat!*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$profile->full_name}*! 👋\n\n"
                ."Peminjaman Anda telah melewati batas waktu pengembalian.\n\n"
                ."📋 *Detail Keterlambatan:*\n"
                .'  🔖 Kode Pinjam     : *'.$borrow->borrow_code."*\n"
                .'  📅 Batas Kembali   : '.$dueDate."\n"
                .'  ⏳ Keterlambatan   : *'.$daysLate." hari*\n"
                .'  💵 Denda Dikenakan : *Rp '.$amount."*\n\n"
                ."📚 *Buku yang Belum Dikembalikan:*\n"
                .$overdueBookList."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."🚨 Segera kembalikan buku untuk menghindari denda tambahan!\n\n"
                .'_Bookera — Perpustakaan Digital_';
            try {
                (new FonnteService)->send($profile->phone_number, $message);
            } catch (\Exception $e) {
                Log::error('Failed to send overdue WhatsApp: '.$e->getMessage());
            }
        }
    }
}
