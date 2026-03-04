<?php

namespace App\Console\Commands;

use App\Events\BorrowOverdue;
use App\Helpers\ActivityLogger;
use App\Models\Borrow;
use App\Models\Fine;
use App\Models\FineType;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProcessOverdueFines extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'borrows:process-overdue-fines';

    /**
     * The console command description.
     */
    protected $description = 'Check for overdue borrows and automatically create late fines';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $lateFineType = FineType::where('type', 'late')->first();

        if (!$lateFineType) {
            $this->warn('Late fine type not found. Skipping overdue processing.');
            return Command::FAILURE;
        }

        $today = Carbon::today();

        // Get all open borrows whose return_date is past due AND have no late fine yet
        $overdueBorrows = Borrow::with(['user.profile', 'borrowDetails.bookCopy.book', 'fines.fineType'])
            ->where('status', 'open')
            ->where('return_date', '<', $today)
            ->whereDoesntHave('fines', function ($q) use ($lateFineType) {
                $q->where('fine_type_id', $lateFineType->id);
            })
            ->get();

        if ($overdueBorrows->isEmpty()) {
            $this->info('No overdue borrows found without late fines.');
            return Command::SUCCESS;
        }

        $processedCount = 0;

        foreach ($overdueBorrows as $borrow) {
            /** @var Borrow $borrow */
            try {
                DB::transaction(function () use ($borrow, $lateFineType, $today, &$processedCount) {
                    /** @var Borrow $borrow */
                    $daysLate = Carbon::parse($borrow->return_date)->diffInDays($today);
                    $totalAmount = $lateFineType->amount * max(1, $daysLate);

                    $fine = Fine::create([
                        'borrow_id'    => $borrow->id,
                        'fine_type_id' => $lateFineType->id,
                        'amount'       => $totalAmount,
                        'status'       => 'unpaid',
                        'notes'        => "Denda keterlambatan {$daysLate} hari (due: {$borrow->return_date})",
                    ]);

                    ActivityLogger::log(
                        'create',
                        'fine',
                        "Late fine auto-created for overdue borrow #{$borrow->id} ({$daysLate} days late)",
                        [
                            'fine_id'    => $fine->id,
                            'borrow_id'  => $borrow->id,
                            'days_late'  => $daysLate,
                            'amount'     => $totalAmount,
                        ],
                        null,
                        $fine
                    );

                    $fine->load('fineType', 'borrow.user', 'borrow.borrowDetails.bookCopy.book');

                    event(new BorrowOverdue($borrow, $fine));

                    $processedCount++;
                });
            } catch (\Exception $e) {
                $this->error("Failed to process borrow #{$borrow->id}: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$processedCount} overdue borrow(s) with late fines.");
        return Command::SUCCESS;
    }
}
