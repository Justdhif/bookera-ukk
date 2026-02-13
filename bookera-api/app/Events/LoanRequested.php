<?php

namespace App\Events;

use App\Models\Loan;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LoanRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $loan;

    public function __construct(Loan $loan)
    {
        $this->loan = $loan;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'loan.requested';
    }

    public function broadcastWith(): array
    {
        return [
            'loan_id' => $this->loan->id,
            'user_name' => $this->loan->user->profile->full_name ?? 'Unknown',
            'message' => 'New borrow request from ' . ($this->loan->user->profile->full_name ?? 'Unknown'),
            'type' => 'borrow_request',
        ];
    }
}
