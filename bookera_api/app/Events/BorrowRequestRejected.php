<?php

namespace App\Events;

use App\Models\BorrowRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowRequestRejected implements ShouldBroadcastNow
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
            new PrivateChannel('user.'.$this->borrowRequest->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'borrow_request.rejected';
    }

    public function broadcastWith(): array
    {
        return [
            'request_id' => $this->borrowRequest->id,
            'reject_reason' => $this->borrowRequest->reject_reason,
            'message' => 'Your borrow request has been rejected',
            'type' => 'borrow_request_rejected',
        ];
    }
}
