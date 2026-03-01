<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\NotificationService;

class SendReturnNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle($event)
    {
        $bookReturn = $event->bookReturn;
        $borrow = $bookReturn->borrow;

        // Notifikasi saat user request return
        if ($event instanceof \App\Events\ReturnRequested) {

            $admins = User::where('role', 'admin')->pluck('id');

            $bookTitles = $bookReturn->details->map(function($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $bookReturn->details->count();
            $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Return Request',
                    "User {$borrow->user->profile->full_name} wants to return {$bookTitles}{$moreText} (Borrow #{$borrow->id})",
                    'return_request',
                    'return',
                    ['return_id' => $bookReturn->id, 'borrow_id' => $borrow->id]
                );
            }

        }

        // Notifikasi saat admin approve return
        if ($event instanceof \App\Events\ReturnApproved) {

            $userId = $borrow->user_id;

            $bookTitles = $bookReturn->details->map(function($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $bookReturn->details->count();
            $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            NotificationService::send(
                $userId,
                'Return Completed',
                "Your return for {$bookTitles}{$moreText} has been processed successfully. Thank you!",
                'approved',
                'return',
                ['return_id' => $bookReturn->id, 'borrow_id' => $borrow->id]
            );

        }
    }
}
