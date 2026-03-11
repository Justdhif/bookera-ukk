<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Publisher;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $authors    = Author::where('is_active', true)->pluck('id');
        $publishers = Publisher::where('is_active', true)->pluck('id');
        $categories = Category::pluck('id');

        // Create 60 active books, all with covers
        Book::factory(60)->active()->withCover()->create()->each(function (Book $book) use ($authors, $publishers, $categories) {
            // Attach 1-3 authors per book
            if ($authors->isNotEmpty()) {
                $book->authors()->attach(
                    $authors->random(min(rand(1, 3), $authors->count()))->toArray()
                );
            }

            // Attach 1-2 publishers per book
            if ($publishers->isNotEmpty()) {
                $book->publishers()->attach(
                    $publishers->random(min(rand(1, 2), $publishers->count()))->toArray()
                );
            }

            // Attach 1-3 categories per book
            if ($categories->isNotEmpty()) {
                $book->categories()->attach(
                    $categories->random(min(rand(1, 3), $categories->count()))->toArray()
                );
            }
        });

        // Create 5 inactive books with covers
        Book::factory(5)->inactive()->withCover()->create();
    }
}
