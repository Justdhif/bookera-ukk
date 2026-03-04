<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run overdue fine processing every day at midnight
// withoutOverlapping() prevents double execution if the previous run is still going
Schedule::command('borrows:process-overdue-fines')
    ->dailyAt('00:00')
    ->withoutOverlapping()
    ->runInBackground();
