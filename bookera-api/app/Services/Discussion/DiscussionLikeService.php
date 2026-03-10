<?php

namespace App\Services\Discussion;

use App\Events\DiscussionPostUpdated;
use App\Models\DiscussionLike;
use App\Models\DiscussionPost;
use App\Models\Notification;
use App\Models\User;

class DiscussionLikeService
{
    public function toggle(User $user, DiscussionPost $post): array
    {
        $existing = DiscussionLike::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('likes_count');
            $liked = false;
        } else {
            DiscussionLike::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
            $post->increment('likes_count');
            $liked = true;

            if ($post->user_id !== $user->id) {
                $actorName = $user->profile?->full_name ?? $user->email;

                Notification::create([
                    'user_id' => $post->user_id,
                    'title'   => 'Postinganmu disukai',
                    'message' => "{$actorName} menyukai postinganmu.",
                    'type'    => 'discussion_like',
                    'module'  => 'discussion',
                    'data'    => [
                        'post_id'   => $post->id,
                        'post_slug' => $post->slug,
                        'actor_id'  => $user->id,
                    ],
                ]);
            }
        }

        $post->refresh();

        // Broadcast post update with user action
        broadcast(new DiscussionPostUpdated(
            $post->slug,
            $post->likes_count,
            $post->comments_count,
            $user->id,
            $liked ? 'liked' : 'unliked'
        ));

        return [
            'liked'       => $liked,
            'likes_count' => $post->likes_count,
        ];
    }
}
