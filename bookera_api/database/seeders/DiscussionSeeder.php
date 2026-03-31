<?php

namespace Database\Seeders;

use App\Models\DiscussionComment;
use App\Models\DiscussionLike;
use App\Models\DiscussionPost;
use App\Models\DiscussionPostImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class DiscussionSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak Postingan Diskusi yang ingin dibuat?', 10);

        if ($count > 0) {
            $users = User::all();

            if ($users->count() > 0) {
                DiscussionPost::factory($count)->make()->each(function ($post) use ($users) {
                    $post->user_id = $users->random()->id;
                    $post->save();

                    $imageCount = rand(1, 3);
                    for ($i = 0; $i < $imageCount; $i++) {
                        DiscussionPostImage::create([
                            'post_id' => $post->id,
                            'image_path' => 'https://picsum.photos/seed/'.$post->slug.'-'.$i.'/800/600',
                            'order' => $i,
                        ]);
                    }

                    DiscussionComment::factory(rand(0, 5))->create([
                        'post_id' => $post->id,
                        'user_id' => $users->random()->id,
                    ]);

                    $likeCount = min(rand(0, 5), $users->count());
                    $likedUsers = $users->random($likeCount);
                    foreach ($likedUsers as $u) {
                        DiscussionLike::factory()->create([
                            'post_id' => $post->id,
                            'user_id' => $u->id,
                        ]);
                    }
                });
                $this->command->info("✅ Berhasil membuat {$count} data Postingan Diskusi.");
            } else {
                $this->command->warn('Gagal membuat data postingan diskusi: User masih kosong.');
            }
        }
    }
}
