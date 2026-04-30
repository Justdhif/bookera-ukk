<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Services\Reservation\ReservationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class CancelExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel reservations that have been notified for more than 24 hours without a borrow request.';

    /**
     * Execute the console command.
     */
    public function handle(ReservationService $reservationService)
    {
        $this->info('Checking for expired reservations...');

        $expiredReservations = Reservation::where('status', 'notified')
            ->where('notified_at', '<', Carbon::now()->subDay())
            ->get();

        if ($expiredReservations->isEmpty()) {
            $this->info('No expired reservations found.');
            return;
        }

        foreach ($expiredReservations as $reservation) {
            $this->warn("Cancelling reservation #{$reservation->id} for User #{$reservation->user_id}");
            
            // We pass null for user in service cancel to indicate system-forced cancellation
            // but the service expects a User model. We can pass a dummy system user or update service.
            // In this case, we'll use the user owner but bypass the check in service if we want.
            $reservationService->cancel($reservation, $reservation->user);
            
            $this->info("Reservation #{$reservation->id} cancelled and next in queue notified.");
        }

        $this->info('Expired reservations processing complete.');
    }
}
