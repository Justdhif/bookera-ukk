<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookReview;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookReviewSeeder extends Seeder
{
    public function run(): void
    {
        if ($this->command->confirm('Apakah Anda ingin membuat data Rating dan Ulasan Buku?', true)) {
            $books = Book::all();
            $users = User::all();
            $reviewCount = 0;

            if ($books->count() > 0 && $users->count() > 0) {
                foreach ($books as $index => $book) {
                    $isPopular = $index === 0;
                    $userCountToReview = $isPopular ? min(15, $users->count()) : rand(1, min(5, $users->count()));

                    $reviewers = $users->random($userCountToReview);

                    foreach ($reviewers as $user) {
                        if (!BookReview::where('user_id', $user->id)->where('book_id', $book->id)->exists()) {
                            BookReview::factory()->create([
                                'user_id' => $user->id,
                                'book_id' => $book->id,
                                'rating' => $isPopular ? rand(4, 5) : rand(3, 5),
                            ]);
                            $reviewCount++;
                        }
                    }
                }
                $this->command->info("✅ Berhasil membuat {$reviewCount} data Rating dan Ulasan.");
            } else {
                $this->command->warn('Gagal membuat data ulasan: Book atau User masih kosong.');
            }
        } else {
            $this->command->info('⏭️ Melewati pembuatan Rating dan Ulasan Buku.');
        }
    }
}
