<?php

namespace App\Events;

use App\Models\LostBook;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LostBookReported implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lostBook;

    public function __construct(LostBook $lostBook)
    {
        $this->lostBook = $lostBook;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'lost-book.reported';
    }

    public function broadcastWith(): array
    {
        $borrow = $this->lostBook->borrow;
        $bookCopy = $this->lostBook->bookCopy;
        $user = $borrow?->user;

        $userName = $user?->profile?->full_name ?? $user?->email ?? 'Unknown User';
        $bookTitle = $bookCopy?->book?->title ?? 'Unknown';
        $copyCode = $bookCopy?->copy_code ?? 'N/A';

        return [
            'lost_book_id' => $this->lostBook->id,
            'borrow_id' => $borrow?->id,
            'user_name' => $userName,
            'book_title' => $bookTitle,
            'copy_code' => $copyCode,
            'message' => "User {$userName} reported lost book: {$bookTitle} (Copy: {$copyCode})",
            'type' => 'lost_book_report',
        ];
    }
}
