<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\NotificationService;

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

        // Notifikasi saat user request borrow (approval_status: pending)
        if ($event instanceof \App\Events\LoanRequested) {

            $admins = User::where('role', 'admin')->pluck('id');

            $bookTitles = $loan->loanDetails->map(function($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $loan->loanDetails->count();
            $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Borrow Request',
                    "{$loan->user->profile->full_name} wants to borrow {$bookTitles}{$moreText} (Loan #{$loan->id})",
                    'borrow_request',
                    'loan',
                    ['loan_id' => $loan->id]
                );
            }

        }

        // Notifikasi saat admin approve loan (approval_status: approved)
        if ($event instanceof \App\Events\LoanApproved) {

            $bookTitles = $loan->loanDetails->map(function($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $loan->loanDetails->count();
            $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            NotificationService::send(
                $loan->user_id,
                'Loan Approved',
                "Your request to borrow {$bookTitles}{$moreText} has been approved. Please collect your books!",
                'approved',
                'loan',
                ['loan_id' => $loan->id]
            );

        }

        // Notifikasi saat admin reject loan (approval_status: rejected)
        if ($event instanceof \App\Events\LoanRejected) {

            $bookTitles = $loan->loanDetails->map(function($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $loan->loanDetails->count();
            $moreText = $totalBooks > 2 ? " and " . ($totalBooks - 2) . " more" : "";

            $reason = $event->reason ? ": {$event->reason}" : "";

            NotificationService::send(
                $loan->user_id,
                'Loan Request Rejected',
                "Your request to borrow {$bookTitles}{$moreText} has been rejected{$reason}",
                'rejected',
                'loan',
                [
                    'loan_id' => $loan->id,
                    'reason' => $event->reason ?? null
                ]
            );
        }
    }
}
