<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BookCopy;
use App\Models\Book;

class BookCopySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $books = Book::all();

        if ($books->isEmpty()) {
            $this->command->warn('No books found. Please run BookSeeder first.');
            return;
        }

        $statuses = ['available', 'available', 'available', 'available', 'borrowed', 'available'];

        // Create 3 copies for each book
        foreach ($books as $index => $book) {
            for ($i = 1; $i <= 3; $i++) {
                BookCopy::create([
                    'book_id' => $book->id,
                    'copy_code' => sprintf('BOOK-%03d-COPY-%02d', $book->id, $i),
                    'status' => $statuses[array_rand($statuses)],
                ]);
            }
        }
    }
}
