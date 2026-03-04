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
            new PrivateChannel('user.' . $this->fine->borrow->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'fine.created';
    }

    public function broadcastWith(): array
    {
        $borrow = $this->fine->borrow;
        $bookTitles = $borrow->borrowDetails->map(function($detail) {
            return $detail->bookCopy->book->title ?? 'Unknown';
        })->take(2)->implode(', ');

        $totalBooks = $borrow->borrowDetails->count();
        $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

        $fineTypeName = $this->fine->fineType->name ?? 'Fine';
        $amount = number_format($this->fine->amount, 0, ',', '.');

        return [
            'fine_id'    => $this->fine->id,
            'borrow_id'  => $this->fine->borrow_id,
            'amount'     => $this->fine->amount,
            'fine_type'  => $fineTypeName,
            'status'     => $this->fine->status,
            'created_at' => $this->fine->created_at,
            'message'    => "A fine of Rp {$amount} has been issued for {$bookTitles}{$moreText} ({$fineTypeName}). Please check My Fines page.",
            'type'       => 'fine_created',
        ];
    }
}
