<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Database\Seeder;

class BookCopySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $books = Book::where('is_active', true)->pluck('id');

        foreach ($books as $bookId) {
            $copyCount = rand(2, 5);

            for ($i = 1; $i <= $copyCount; $i++) {
                // Format: BK-{book_id}-{sequence}, e.g. BK-001-01
                $copyCode = sprintf('BK-%03d-%02d', $bookId, $i);

                BookCopy::create([
                    'book_id' => $bookId,
                    'copy_code' => $copyCode,
                    'status' => $this->randomStatus(),
                ]);
            }
        }
    }

    private function randomStatus(): string
    {
        // Weighted: mostly available
        $weights = [
            'available' => 75,
            'borrowed' => 18,
            'damaged' => 5,
            'lost' => 2,
        ];

        $total = array_sum($weights);
        $rand = rand(1, $total);
        $cumulative = 0;

        foreach ($weights as $status => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $status;
            }
        }

        return 'available';
    }
}
