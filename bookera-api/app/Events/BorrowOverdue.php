<?php

namespace App\Events;

use App\Models\Borrow;
use App\Models\Fine;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowOverdue implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Borrow $borrow;

    public Fine $fine;

    public function __construct(Borrow $borrow, Fine $fine)
    {
        $this->borrow = $borrow;
        $this->fine = $fine;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->borrow->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'borrow.overdue';
    }

    public function broadcastWith(): array
    {
        $amount = number_format($this->fine->amount, 0, ',', '.');
        $dueDate = $this->borrow->return_date;
        $bookTitles = $this->borrow->borrowDetails
            ->map(fn ($detail) => $detail->bookCopy->book->title ?? 'Unknown')
            ->take(2)
            ->implode(', ');

        return [
            'borrow_id' => $this->borrow->id,
            'borrow_code' => $this->borrow->borrow_code,
            'fine_id' => $this->fine->id,
            'amount' => $this->fine->amount,
            'due_date' => $dueDate,
            'message' => "Peminjaman buku \"{$bookTitles}\" telah melewati batas waktu pengembalian ({$dueDate}). Denda keterlambatan sebesar Rp {$amount} telah diterapkan.",
            'type' => 'borrow_overdue',
        ];
    }
}
