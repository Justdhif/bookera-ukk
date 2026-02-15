<?php

namespace App\Events;

use App\Models\Fine;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FineCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $fine;

    public function __construct(Fine $fine)
    {
        $this->fine = $fine;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->fine->loan->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'fine.created';
    }

    public function broadcastWith(): array
    {
        $loan = $this->fine->loan;
        $bookTitles = $loan->details->map(function($detail) {
            return $detail->bookCopy->book->title ?? 'Unknown';
        })->take(2)->implode(', ');

        $totalBooks = $loan->details->count();
        $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

        $fineTypeName = $this->fine->fineType->name ?? 'Damaged Book';
        $amount = number_format($this->fine->amount, 0, ',', '.');

        return [
            'fine_id' => $this->fine->id,
            'loan_id' => $this->fine->loan_id,
            'amount' => $this->fine->amount,
            'fine_type' => $fineTypeName,
            'status' => $this->fine->status,
            'created_at' => $this->fine->created_at,
            'message' => "A fine of Rp {$amount} has been issued for {$bookTitles}{$moreText} ({$fineTypeName}). Please check My Fines page.",
            'type' => 'fine_created',
        ];
    }
}
