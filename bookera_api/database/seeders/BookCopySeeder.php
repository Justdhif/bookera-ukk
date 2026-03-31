<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Database\Seeder;

class BookCopySeeder extends Seeder
{
    public function run(): void
    {
        if ($this->command->confirm('Apakah Anda ingin membuat data Salinan Buku (Book Copy)?', true)) {
            $books = Book::all();
            $copyCountTotal = 0;

            if ($books->count() > 0) {
                foreach ($books as $book) {
                    if ($book->copies()->count() == 0) {
                        $copyCount = rand(2, 5);
                        for ($i = 0; $i < $copyCount; $i++) {
                            BookCopy::factory()->create([
                                'book_id' => $book->id,
                            ]);
                            $copyCountTotal++;
                        }
                    }
                }
                $this->command->info("✅ Berhasil membuat {$copyCountTotal} data Salinan Buku.");
            } else {
                $this->command->warn('Gagal membuat data salinan buku: Buku masih kosong.');
            }
        } else {
            $this->command->info('⏭️ Melewati pembuatan Salinan Buku.');
        }
    }
}
