<?php

namespace App\Listeners;

use App\Events\BorrowOverdue;
use App\Services\NotificationService;
use Carbon\Carbon;

class SendOverdueFineNotification
{
    public function __construct() {}

    public function handle(BorrowOverdue $event): void
    {
        $borrow = $event->borrow;
        $fine   = $event->fine;

        $userId = $borrow->user_id;

        $bookTitles = $borrow->borrowDetails
            ->map(fn($detail) => $detail->bookCopy->book->title ?? 'Unknown')
            ->take(2)
            ->implode(', ');

        $totalBooks = $borrow->borrowDetails->count();
        $moreText   = $totalBooks > 2 ? ' dan ' . ($totalBooks - 2) . ' lainnya' : '';

        $amount  = number_format($fine->amount, 0, ',', '.');
        $dueDate = Carbon::parse($borrow->return_date)->format('d M Y');

        NotificationService::send(
            $userId,
            'Peminjaman Telat - Denda Otomatis',
            "Peminjaman buku \"{$bookTitles}{$moreText}\" melewati batas waktu ({$dueDate}). Denda keterlambatan sebesar Rp {$amount} telah dikenakan.",
            'borrow_overdue',
            'fine',
            [
                'borrow_id' => $borrow->id,
                'fine_id'   => $fine->id,
                'amount'    => $fine->amount,
                'due_date'  => $borrow->return_date,
            ]
        );
    }
}
