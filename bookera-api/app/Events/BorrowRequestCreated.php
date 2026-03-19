<?php

namespace App\Events;

use App\Models\BorrowRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowRequestCreated implements ShouldBroadcastNow
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
        return 'borrow_request.created';
    }

    public function broadcastWith(): array
    {
        $bookTitles = $this->borrowRequest->borrowRequestDetails
            ->take(2)
            ->map(fn ($d) => $d->book->title ?? 'Unknown')
            ->implode(', ');

        $total = $this->borrowRequest->borrowRequestDetails->count();
        $moreText = $total > 2 ? ' and '.($total - 2).' more' : '';
        $userName = $this->borrowRequest->user->profile->full_name ?? 'Unknown';

        return [
            'request_id' => $this->borrowRequest->id,
            'user_name' => $userName,
            'message' => "{$userName} wants to borrow {$bookTitles}{$moreText}",
            'type' => 'borrow_request_created',
        ];
    }
}
