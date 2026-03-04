<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Listeners\LogLoginActivity;
use App\Listeners\LogLogoutActivity;
use App\Events\BorrowRequested;
use App\Events\BorrowRequestCreated;
use App\Events\BorrowRequestApproved;
use App\Events\BorrowRequestCancelled;
use App\Events\BorrowRequestRejected;
use App\Events\ReturnRequested;
use App\Events\ReturnApproved;
use App\Events\FineCreated;
use App\Events\BorrowOverdue;
use App\Events\LostBookReported;
use App\Listeners\SendBorrowNotification;
use App\Listeners\SendReturnNotification;
use App\Listeners\SendFineNotification;
use App\Listeners\SendLostBookNotification;
use App\Listeners\SendOverdueFineNotification;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [
            LogLoginActivity::class,
        ],

        Logout::class => [
            LogLogoutActivity::class,
        ],

        BorrowRequested::class => [
            SendBorrowNotification::class,
        ],

        BorrowRequestCreated::class => [
            SendBorrowNotification::class,
        ],

        BorrowRequestApproved::class => [
            SendBorrowNotification::class,
        ],

        BorrowRequestRejected::class => [
            SendBorrowNotification::class,
        ],

        BorrowRequestCancelled::class => [
            SendBorrowNotification::class,
        ],

        ReturnRequested::class => [
            SendReturnNotification::class,
        ],
        ReturnApproved::class => [
            SendReturnNotification::class,
        ],

        FineCreated::class => [
            SendFineNotification::class,
        ],

        LostBookReported::class => [
            SendLostBookNotification::class,
        ],

        BorrowOverdue::class => [
            SendOverdueFineNotification::class,
        ],
    ];

    public function boot(): void
    {
        // logger('EventServiceProvider booted');
    }
}
