<?php

namespace App\Providers;

use App\Listeners\LogLoginActivity;
use App\Listeners\LogLogoutActivity;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [
            LogLoginActivity::class,
        ],

        Logout::class => [
            LogLogoutActivity::class,
        ],

    ];

    public function boot(): void
    {
        // logger('EventServiceProvider booted');
    }
}
