<?php

namespace App\Listeners;

use App\Events\LostBookReported;
use App\Models\User;
use App\Services\NotificationService;

class SendLostBookNotification
{
    public function __construct()
    {
    }

    public function handle(LostBookReported $event)
    {
        $lostBook = $event->lostBook;
        $loan = $lostBook->loan;
        $bookCopy = $lostBook->bookCopy;
        $user = $loan->user;

        $admins = User::where('role', 'admin')->pluck('id');

        foreach ($admins as $adminId) {
            NotificationService::send(
                $adminId,
                'Lost Book Reported',
                "User {$user->profile->full_name} reported lost book: {$bookCopy->book->title} (Copy: {$bookCopy->copy_code}) - Loan #{$loan->id}",
                'lost_book_report',
                'lost_book',
                ['lost_book_id' => $lostBook->id, 'loan_id' => $loan->id]
            );
        }
    }
}
