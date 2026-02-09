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
use App\Events\ReturnRequested;
use App\Events\ReturnApproved;
use App\Events\ReturnRejected;
use App\Listeners\SendLoanNotification;
use App\Listeners\SendReturnNotification;

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

        ReturnRequested::class => [
            SendReturnNotification::class,
        ],
        ReturnApproved::class => [
            SendReturnNotification::class,
        ],
        ReturnRejected::class => [
            SendReturnNotification::class,
        ],
    ];

    public function boot(): void
    {
        // logger('EventServiceProvider booted');
    }
}
