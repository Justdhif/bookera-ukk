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
        $loan = $this->lostBook->loan;
        $bookCopy = $this->lostBook->bookCopy;
        $user = $loan->user;

        return [
            'lost_book_id' => $this->lostBook->id,
            'loan_id' => $loan->id,
            'user_name' => $user->profile->full_name ?? $user->email,
            'book_title' => $bookCopy->book->title ?? 'Unknown',
            'copy_code' => $bookCopy->copy_code,
            'message' => "User {$user->profile->full_name} reported lost book: {$bookCopy->book->title} (Copy: {$bookCopy->copy_code})",
            'type' => 'lost_book_report',
        ];
    }
}
