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
        $fine = $event->fine;
        $loan = $fine->loan;
        $userId = $loan->user_id;

        $bookTitles = $loan->details->map(function($detail) {
            return $detail->bookCopy->book->title ?? 'Unknown';
        })->take(2)->implode(', ');

        $totalBooks = $loan->details->count();
        $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

        $fineTypeName = $fine->fineType->name ?? 'Damaged Book';
        $amount = number_format($fine->amount, 0, ',', '.');

        NotificationService::send(
            $userId,
            'Fine Issued',
            "A fine of Rp {$amount} has been issued for {$bookTitles}{$moreText} ({$fineTypeName}). Please check My Fines page.",
            'fine_created',
            'fine',
            ['fine_id' => $fine->id, 'loan_id' => $loan->id]
        );
    }
}
