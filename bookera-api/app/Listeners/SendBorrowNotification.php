<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\NotificationService;

class SendBorrowNotification
{
    public function __construct()
    {
        //
    }

    public function handle($event): void
    {
        $borrow = $event->borrow;

        // Notification when user requests a borrow
        if ($event instanceof \App\Events\BorrowRequested) {

            $admins = User::where('role', 'admin')->pluck('id');

            $bookTitles = $borrow->borrowDetails->map(function ($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $borrow->borrowDetails->count();
            $moreText   = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Borrow Request',
                    "{$borrow->user->profile->full_name} wants to borrow {$bookTitles}{$moreText} (Borrow #{$borrow->id})",
                    'borrow_request',
                    'borrow',
                    ['borrow_id' => $borrow->id]
                );
            }
        }
    }
}
