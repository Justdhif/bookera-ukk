<?php

namespace App\Events;

use App\Models\Borrow;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $borrow;

    public function __construct(Borrow $borrow)
    {
        $this->borrow = $borrow;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'borrow.requested';
    }

    public function broadcastWith(): array
    {
        return [
            'borrow_id' => $this->borrow->id,
            'user_name' => $this->borrow->user->profile->full_name ?? 'Unknown',
            'message'   => 'New borrow request from ' . ($this->borrow->user->profile->full_name ?? 'Unknown'),
            'type'      => 'borrow_request',
        ];
    }
}
