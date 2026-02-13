<?php

namespace App\Events;

use App\Models\BookReturn;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $bookReturn;

    public function __construct(BookReturn $bookReturn)
    {
        $this->bookReturn = $bookReturn;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'return.requested';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'return_id' => $this->bookReturn->id,
            'loan_id' => $this->bookReturn->loan_id,
            'user_name' => $this->bookReturn->loan->user->profile->full_name ?? 'Unknown',
            'message' => 'New return request',
            'type' => 'return_request',
        ];
    }
}
