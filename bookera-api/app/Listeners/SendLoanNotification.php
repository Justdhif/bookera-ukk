<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendLoanNotification
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
        $loan = $event->loan;

        if ($event instanceof \App\Events\LoanRequested) {

            $admins = User::where('role', 'admin')->pluck('id');

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Borrow Request',
                    "Loan #{$loan->id} requested",
                    'borrow_request',
                    'loan',
                    ['loan_id' => $loan->id]
                );
            }

        }

        if ($event instanceof \App\Events\LoanApproved) {

            NotificationService::send(
                $loan->user_id,
                'Approved',
                "Loan #{$loan->id} approved",
                'approved',
                'loan',
                ['loan_id' => $loan->id]
            );

        }

        if ($event instanceof \App\Events\LoanRejected) {

            NotificationService::send(
                $loan->user_id,
                'Rejected',
                "Loan #{$loan->id} rejected",
                'rejected',
                'loan',
                ['loan_id' => $loan->id]
            );
        }
    }
}
