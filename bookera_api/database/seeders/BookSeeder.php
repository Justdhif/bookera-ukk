<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Publisher;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak Buku yang ingin dibuat?', 20);

        if ($count > 0) {
            $categories = Category::all();
            $genres = Genre::all();
            $authors = Author::all();
            $publishers = Publisher::all();

            if ($categories->count() > 0 && $genres->count() > 0 && $authors->count() > 0 && $publishers->count() > 0) {
                Book::factory($count)->create()->each(function ($book) use ($categories, $genres, $authors, $publishers) {
                    $book->categories()->attach(
                        $categories->random(rand(1, min(3, $categories->count())))->pluck('id')
                    );
                    $book->genres()->attach(
                        $genres->random(rand(1, min(3, $genres->count())))->pluck('id')
                    );
                    $book->authors()->attach(
                        $authors->random(rand(1, min(2, $authors->count())))->pluck('id')
                    );
                    $book->publishers()->attach(
                        $publishers->random(rand(1, min(2, $publishers->count())))->pluck('id')
                    );
                });
                $this->command->info("✅ Berhasil membuat {$count} data Buku.");
            } else {
                $this->command->warn('Gagal membuat data buku: Category, Genre, Author, atau Publisher masih kosong.');
            }
        }
    }
}
