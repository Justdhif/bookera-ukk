<?php

namespace App\Events;

use App\Models\Borrow;
use App\Models\BorrowRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowRequestApproved implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public BorrowRequest $borrowRequest;

    public Borrow $borrow;

    public function __construct(BorrowRequest $borrowRequest, Borrow $borrow)
    {
        $this->borrowRequest = $borrowRequest;
        $this->borrow = $borrow;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->borrowRequest->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'borrow_request.approved';
    }

    public function broadcastWith(): array
    {
        return [
            'request_id' => $this->borrowRequest->id,
            'borrow_id' => $this->borrow->id,
            'borrow_code' => $this->borrow->borrow_code,
            'message' => 'Your borrow request has been approved',
            'type' => 'borrow_request_approved',
        ];
    }
}
