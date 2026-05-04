<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\NewsComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak berita yang ingin dibuat?', 10);

        if ($count > 0) {
            News::factory()->count($count)->create()->each(function ($news) {
                NewsComment::factory()
                    ->count(rand(3, 8))
                    ->create([
                        'news_id' => $news->id,
                        'image'   => rand(0, 1) ? "https://picsum.photos/seed/comment_" . rand(1, 5000) . "/800/600" : null,
                    ])
                    ->each(function ($comment) use ($news) {
                        if (rand(0, 1)) {
                            NewsComment::factory()
                                ->count(rand(1, 3))
                                ->create([
                                    'news_id'   => $news->id,
                                    'parent_id' => $comment->id,
                                    'image'     => rand(0, 1) ? "https://picsum.photos/seed/reply_" . rand(1, 5000) . "/800/600" : null,
                                ]);
                        }
                    });
            });

            $this->command->info('✅ Berhasil membuat data berita!');
        }
    }
}
