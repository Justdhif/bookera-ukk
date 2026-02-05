<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Loan;
use App\Models\LoanDetail;
use App\Models\BookCopy;
use App\Models\User;
use Carbon\Carbon;

class LoanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users with 'user' role
        $users = User::where('role', 'user')->get();
        
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        // Get book copies
        $bookCopies = BookCopy::whereIn('status', ['borrowed', 'available'])->get();
        
        if ($bookCopies->isEmpty()) {
            $this->command->warn('No book copies found. Please run BookCopySeeder first.');
            return;
        }

        $loans = [
            [
                'loan_date' => Carbon::now()->subDays(10),
                'due_date' => Carbon::now()->subDays(3),
                'status' => 'returned',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(8),
                'due_date' => Carbon::now()->subDays(1),
                'status' => 'returned',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(7),
                'due_date' => Carbon::now()->addDays(7),
                'status' => 'borrowed',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(6),
                'due_date' => Carbon::now()->addDays(8),
                'status' => 'borrowed',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(5),
                'due_date' => Carbon::now()->addDays(9),
                'status' => 'borrowed',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(4),
                'due_date' => Carbon::now()->addDays(10),
                'status' => 'borrowed',
                'approval_status' => 'pending',
            ],
            [
                'loan_date' => Carbon::now()->subDays(15),
                'due_date' => Carbon::now()->subDays(8),
                'status' => 'late',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(3),
                'due_date' => Carbon::now()->addDays(11),
                'status' => 'borrowed',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(2),
                'due_date' => Carbon::now()->addDays(12),
                'status' => 'borrowed',
                'approval_status' => 'pending',
            ],
            [
                'loan_date' => Carbon::now()->subDays(1),
                'due_date' => Carbon::now()->addDays(13),
                'status' => 'borrowed',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(12),
                'due_date' => Carbon::now()->subDays(5),
                'status' => 'returned',
                'approval_status' => 'approved',
            ],
            [
                'loan_date' => Carbon::now()->subDays(20),
                'due_date' => Carbon::now()->subDays(13),
                'status' => 'late',
                'approval_status' => 'approved',
            ],
        ];

        $copyIndex = 0;
        foreach ($loans as $loanData) {
            if ($copyIndex >= $bookCopies->count()) {
                break;
            }

            $user = $users->random();
            $bookCopy = $bookCopies[$copyIndex];

            $loan = Loan::create([
                'user_id' => $user->id,
                'loan_date' => $loanData['loan_date'],
                'due_date' => $loanData['due_date'],
                'status' => $loanData['status'],
                'approval_status' => $loanData['approval_status'],
            ]);

            // Create loan detail
            LoanDetail::create([
                'loan_id' => $loan->id,
                'book_copy_id' => $bookCopy->id,
            ]);

            // Update book copy status
            if ($loanData['status'] === 'borrowed' || $loanData['status'] === 'late') {
                $bookCopy->update(['status' => 'borrowed']);
            }

            $copyIndex++;
        }

        $this->command->info('Created ' . count($loans) . ' loans.');
    }
}
