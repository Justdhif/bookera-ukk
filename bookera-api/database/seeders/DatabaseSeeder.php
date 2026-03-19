<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Author;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookReturn;
use App\Models\BookReturnDetail;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\Category;
use App\Models\DiscussionComment;
use App\Models\DiscussionLike;
use App\Models\DiscussionPost;
use App\Models\DiscussionPostImage;
use App\Models\Fine;
use App\Models\FineType;
use App\Models\PrivacyPolicy;
use App\Models\Publisher;
use App\Models\TermsOfService;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->command->info('=== Interactive Bookera Database Seeder ===');
        $this->command->info('Masukkan angka 0 jika Anda tidak ingin meng-generate data untuk tabel tersebut.');

        $counts = [
            'User' => (int) $this->command->ask('Berapa banyak User yang ingin di-generate?', 10),
            'Category' => (int) $this->command->ask('Berapa banyak Category?', 5),
            'Author' => (int) $this->command->ask('Berapa banyak Author?', 5),
            'Publisher' => (int) $this->command->ask('Berapa banyak Publisher?', 5),
            'Book' => (int) $this->command->ask('Berapa banyak Book?', 20),
            'Borrow' => (int) $this->command->ask('Berapa banyak Borrow?', 15),
            'DiscussionPost' => (int) $this->command->ask('Berapa banyak Discussion Post?', 10),
            'Fine' => (int) $this->command->ask('Berapa banyak Fine (Denda)?', 5),
            'ActivityLog' => (int) $this->command->ask('Berapa banyak Activity Log?', 20),
            'PrivacyPolicy' => (int) $this->command->ask('Generate Privacy Policy? (1=Ya, 0=Tidak)', 1),
            'TermsOfService' => (int) $this->command->ask('Generate Terms Of Service? (1=Ya, 0=Tidak)', 1),
        ];

        Schema::disableForeignKeyConstraints();

        $this->command->info('Generating data...');

        // 1. Independent Entities
        $users = $counts['User'] > 0 ? User::factory($counts['User'])->create() : collect();
        $categories = $counts['Category'] > 0 ? Category::factory($counts['Category'])->create() : collect();
        $authors = $counts['Author'] > 0 ? Author::factory($counts['Author'])->create() : collect();
        $publishers = $counts['Publisher'] > 0 ? Publisher::factory($counts['Publisher'])->create() : collect();

        if ($counts['PrivacyPolicy'] > 0) {
            PrivacyPolicy::factory()->create();
        }
        if ($counts['TermsOfService'] > 0) {
            TermsOfService::factory()->create();
        }

        // 2. Books
        $books = collect();
        if ($counts['Book'] > 0 && $categories->count() > 0 && $authors->count() > 0 && $publishers->count() > 0) {
            $books = Book::factory($counts['Book'])->create()->each(function ($book) use ($categories, $authors, $publishers) {
                $book->categories()->attach($categories->random()->id);
                $book->authors()->attach($authors->random()->id);
                $book->publishers()->attach($publishers->random()->id);
            });
        }

        // 3. Book Copies
        $bookCopies = collect();
        if ($books->count() > 0) {
            foreach ($books as $book) {
                $copyCount = rand(2, 5);
                for ($i = 0; $i < $copyCount; $i++) {
                    $bookCopies->push(
                        BookCopy::factory()->create([
                            'book_id' => $book->id,
                        ])
                    );
                }
            }
        }

        // 4. Borrows & Returns
        if ($counts['Borrow'] > 0 && $users->count() > 0 && $bookCopies->count() > 0) {
            Borrow::factory($counts['Borrow'])->make()->each(function ($borrow) use ($users, $bookCopies) {
                $borrow->user_id = $users->random()->id;
                $borrow->save();

                // Borrow Details
                BorrowDetail::factory(rand(1, 3))->make()->each(function ($detail) use ($borrow, $bookCopies) {
                    $detail->borrow_id = $borrow->id;
                    $detail->book_copy_id = $bookCopies->random()->id;
                    $detail->save();
                });

                // 30% chance of return
                if (rand(1, 100) <= 30) {
                    $return = BookReturn::factory()->make();
                    $return->borrow_id = $borrow->id;
                    $return->save();

                    foreach ($borrow->borrowDetails as $bDetail) {
                        BookReturnDetail::factory()->create([
                            'book_return_id' => $return->id,
                            'book_copy_id' => $bDetail->book_copy_id,
                        ]);
                    }
                }
            });
        }

        // 5. Discussion Posts, Comments, Likes
        if ($counts['DiscussionPost'] > 0 && $users->count() > 0) {
            DiscussionPost::factory($counts['DiscussionPost'])->make()->each(function ($post) use ($users) {
                $post->user_id = $users->random()->id;
                $post->save();

                // Generate Images
                $imageCount = rand(1, 3);
                for ($i = 0; $i < $imageCount; $i++) {
                    DiscussionPostImage::create([
                        'post_id' => $post->id,
                        'image_path' => 'https://picsum.photos/seed/'.$post->slug.'-'.$i.'/800/600',
                        'order' => $i,
                    ]);
                }

                // Generate Comments
                DiscussionComment::factory(rand(0, 5))->create([
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                ]);

                // Generate Likes
                $likeCount = min(rand(0, 5), $users->count());
                $likedUsers = $users->random($likeCount);
                foreach ($likedUsers as $u) {
                    DiscussionLike::factory()->create([
                        'post_id' => $post->id,
                        'user_id' => $u->id,
                    ]);
                }
            });
        }

        // 6. Fines & Fine Types
        if ($counts['Fine'] > 0 && $users->count() > 0) {
            $fineType = FineType::factory()->create(['name' => 'Late Return']);
            $borrows = Borrow::inRandomOrder()->take($counts['Fine'])->get();
            foreach ($borrows as $borrow) {
                Fine::factory()->create([
                    'borrow_id' => $borrow->id,
                    'fine_type_id' => $fineType->id,
                ]);
            }
        }

        // 7. Activity Logs
        if ($counts['ActivityLog'] > 0 && $users->count() > 0) {
            ActivityLog::factory($counts['ActivityLog'])->create([
                'user_id' => $users->random()->id,
            ]);
        }

        Schema::enableForeignKeyConstraints();

        $this->command->info('✅ Seeding completed successfully!');
    }
}
