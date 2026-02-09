<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

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

        if ($event instanceof \App\Events\ReturnRequested) {

            $admins = User::where('role', 'admin')->pluck('id');

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Return Request',
                    "Return #{$bookReturn->id} requested",
                    'return_request',
                    'return',
                    ['return_id' => $bookReturn->id, 'loan_id' => $bookReturn->loan_id]
                );
            }

        }

        if ($event instanceof \App\Events\ReturnApproved) {

            $userId = $bookReturn->loan->user_id;

            NotificationService::send(
                $userId,
                'Return Approved',
                "Return #{$bookReturn->id} approved",
                'approved',
                'return',
                ['return_id' => $bookReturn->id, 'loan_id' => $bookReturn->loan_id]
            );

        }

        if ($event instanceof \App\Events\ReturnRejected) {

            $userId = $bookReturn->loan->user_id;

            NotificationService::send(
                $userId,
                'Return Rejected',
                "Return #{$bookReturn->id} rejected" . ($event->reason ? ": {$event->reason}" : ''),
                'rejected',
                'return',
                [
                    'return_id' => $bookReturn->id,
                    'loan_id' => $bookReturn->loan_id,
                    'reason' => $event->reason ?? null
                ]
            );
        }
    }
}
