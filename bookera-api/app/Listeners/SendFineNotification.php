<?php

namespace App\Listeners;

use App\Events\FineCreated;
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
    }
}
