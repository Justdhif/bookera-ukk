<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BookReturn;
use App\Models\BookReturnDetail;
use App\Models\Borrow;
use Carbon\Carbon;

class BookReturnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get closed borrows (returned)
        $closedBorrows = Borrow::where('status', 'close')->with('borrowDetails.bookCopy')->get();

        if ($closedBorrows->isEmpty()) {
            $this->command->warn('No closed borrows found. Please run BorrowSeeder first.');
            return;
        }

        foreach ($closedBorrows as $borrow) {
            // Calculate return date
            $borrowDate = Carbon::parse($borrow->borrow_date);
            $returnDate = Carbon::parse($borrow->return_date);
            $actualReturnDate = $borrowDate->copy()->addDays(rand(7, 14));

            $bookReturn = BookReturn::create([
                'borrow_id'   => $borrow->id,
                'return_date' => $actualReturnDate,
            ]);

            // Create return details for each borrowed book copy
            foreach ($borrow->borrowDetails as $borrowDetail) {
                $bookCopy  = $borrowDetail->bookCopy;
                $condition = rand(0, 10) > 8 ? 'damaged' : 'good';

                BookReturnDetail::create([
                    'book_return_id' => $bookReturn->id,
                    'book_copy_id'   => $bookCopy->id,
                    'condition'      => $condition,
                ]);

                // Update book copy status
                $bookCopy->update([
                    'status' => $condition === 'damaged' ? 'damaged' : 'available',
                ]);
            }
        }
    }
}
