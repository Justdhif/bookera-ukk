<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Listeners\LogLoginActivity;
use App\Listeners\LogLogoutActivity;
use App\Events\LoanRequested;
use App\Events\LoanApproved;
use App\Events\LoanRejected;
use App\Listeners\SendLoanNotification;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [
            LogLoginActivity::class,
        ],

        Logout::class => [
            LogLogoutActivity::class,
        ],

        LoanRequested::class => [
            SendLoanNotification::class,
        ],
        LoanApproved::class => [
            SendLoanNotification::class,
        ],
        LoanRejected::class => [
            SendLoanNotification::class,
        ],
    ];

    public function boot(): void
    {
        // logger('EventServiceProvider booted');
    }
}
