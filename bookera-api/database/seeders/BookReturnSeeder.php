<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BookReturn;
use App\Models\BookReturnDetail;
use App\Models\Loan;
use App\Models\LoanDetail;
use Carbon\Carbon;

class BookReturnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get returned loans
        $returnedLoans = Loan::whereIn('status', ['returned'])->with('loanDetails.bookCopy')->get();

        if ($returnedLoans->isEmpty()) {
            $this->command->warn('No returned loans found. Please run LoanSeeder first.');
            return;
        }

        foreach ($returnedLoans as $loan) {
            $daysLate = 0;

            // Calculate if return was late
            $loanDate = Carbon::parse($loan->loan_date);
            $dueDate = Carbon::parse($loan->due_date);
            $returnDate = $loanDate->copy()->addDays(rand(7, 14));

            if ($returnDate->greaterThan($dueDate)) {
                $daysLate = $returnDate->diffInDays($dueDate);
            }

            $bookReturn = BookReturn::create([
                'loan_id' => $loan->id,
                'return_date' => $returnDate,
            ]);

            // Create return details for each loaned book copy
            foreach ($loan->loanDetails as $loanDetail) {
                $bookCopy = $loanDetail->bookCopy;
                $condition = rand(0, 10) > 8 ? 'damaged' : 'good';

                BookReturnDetail::create([
                    'book_return_id' => $bookReturn->id,
                    'book_copy_id' => $bookCopy->id,
                    'condition' => $condition,
                ]);

                // Update book copy status
                $bookCopy->update([
                    'status' => $condition === 'damaged' ? 'damaged' : 'available'
                ]);
            }
        }

        $this->command->info('Created ' . $returnedLoans->count() . ' book returns.');
    }
}
