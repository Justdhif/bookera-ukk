<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiscussionPostUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $slug,
        public int $likesCount,
        public int $commentsCount,
        public ?int $userId = null,
        public ?string $action = null
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('discussion-posts');
    }

    public function broadcastAs(): string
    {
        return 'post.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'slug' => $this->slug,
            'likes_count' => $this->likesCount,
            'comments_count' => $this->commentsCount,
            'user_id' => $this->userId,
            'action' => $this->action,
        ];
    }
}
