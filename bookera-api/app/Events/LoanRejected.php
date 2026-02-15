<?php

namespace App\Events;

use App\Models\Loan;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LoanRejected implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $loan;
    public $reason;

    public function __construct(Loan $loan, $reason = null)
    {
        $this->loan = $loan;
        $this->reason = $reason;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->loan->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'loan.rejected';
    }

    public function broadcastWith(): array
    {
        $approvalStatus = $this->loan->approval_status;
        
        $message = match($approvalStatus) {
            'rejected' => 'All your loan requests have been rejected',
            'partial' => 'Some of your loan requests have been rejected',
            'processing' => 'Your loan request is being processed',
            default => 'Your loan request has been updated',
        };

        return [
            'loan_id' => $this->loan->id,
            'message' => $message,
            'type' => 'rejected',
            'reason' => $this->reason,
            'approval_status' => $approvalStatus,
        ];
    }
}
