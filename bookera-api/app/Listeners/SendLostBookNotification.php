<?php

namespace App\Listeners;

use App\Events\LostBookReported;
use App\Models\User;
use App\Services\NotificationService;

class SendLostBookNotification
{
    public function __construct() {}

    public function handle(LostBookReported $event)
    {
        $lostBook = $event->lostBook;
        $borrow = $lostBook->borrow;
        $bookCopy = $lostBook->bookCopy;
        $user = $borrow?->user;

        $userName = $user?->profile?->full_name ?? $user?->email ?? 'Unknown User';
        $bookTitle = $bookCopy?->book?->title ?? 'Unknown';
        $copyCode = $bookCopy?->copy_code ?? 'N/A';

        $admins = User::where('role', 'admin')->pluck('id');

        foreach ($admins as $adminId) {
            NotificationService::send(
                $adminId,
                'Lost Book Reported',
                "User {$userName} reported lost book: {$bookTitle} (Copy: {$copyCode}) - Borrow #{$borrow?->id}",
                'lost_book_report',
                'lost_book',
                ['lost_book_id' => $lostBook->id, 'borrow_id' => $borrow?->id]
            );
        }
    }
}
