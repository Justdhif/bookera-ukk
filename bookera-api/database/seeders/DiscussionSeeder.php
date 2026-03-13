<?php

namespace Database\Seeders;

use App\Models\DiscussionComment;
use App\Models\DiscussionLike;
use App\Models\DiscussionPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiscussionSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $users = User::query()->select('id')->get();

            if ($users->isEmpty()) {
                return;
            }

            $posts = DiscussionPost::factory()->count(120)->create();

            foreach ($posts as $post) {
                $maxLikes = min(25, $users->count());
                $likeCount = random_int(0, $maxLikes);
                $likedUserIds = $users->shuffle()->take($likeCount)->pluck('id');

                foreach ($likedUserIds as $likedUserId) {
                    DiscussionLike::factory()->create([
                        'post_id' => $post->id,
                        'user_id' => $likedUserId,
                    ]);
                }

                $baseCommentsCount = random_int(0, 10);

                for ($i = 0; $i < $baseCommentsCount; $i++) {
                    $comment = DiscussionComment::factory()->create([
                        'post_id' => $post->id,
                        'user_id' => $users->random()->id,
                        'parent_id' => null,
                    ]);

                    if (random_int(1, 100) <= 40) {
                        $replyCount = random_int(1, 2);
                        for ($j = 0; $j < $replyCount; $j++) {
                            DiscussionComment::factory()->create([
                                'post_id' => $post->id,
                                'user_id' => $users->random()->id,
                                'parent_id' => $comment->id,
                            ]);
                        }
                    }
                }

                $post->update([
                    'likes_count' => DiscussionLike::query()->where('post_id', $post->id)->count(),
                    'comments_count' => DiscussionComment::query()->where('post_id', $post->id)->count(),
                ]);
            }
        });
    }
}
