<?php

namespace App\Events;

use App\Models\BorrowRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowRequestCancelled implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public BorrowRequest $borrowRequest;

    public function __construct(BorrowRequest $borrowRequest)
    {
        $this->borrowRequest = $borrowRequest;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'borrow_request.cancelled';
    }

    public function broadcastWith(): array
    {
        $userName = $this->borrowRequest->user->profile->full_name ?? $this->borrowRequest->user->email;

        return [
            'request_id' => $this->borrowRequest->id,
            'user_name' => $userName,
            'message' => "{$userName} cancelled borrow request #{$this->borrowRequest->id}",
            'type' => 'borrow_request_cancelled',
        ];
    }
}
