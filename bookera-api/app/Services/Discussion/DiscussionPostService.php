<?php

namespace App\Services\Discussion;

use App\Models\DiscussionPost;
use App\Models\DiscussionPostImage;
use App\Models\DiscussionLike;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DiscussionPostService
{
    public function getPosts(?User $authUser, int $perPage = 15): LengthAwarePaginator
    {
        $posts = DiscussionPost::with(['user.profile', 'images'])
            ->latest()
            ->paginate($perPage);

        if ($authUser) {
            $likedIds = DiscussionLike::where('user_id', $authUser->id)
                ->whereIn('post_id', $posts->pluck('id'))
                ->pluck('post_id')
                ->flip();

            $followingUserIds = Follow::where('user_id', $authUser->id)
                ->where('followable_type', User::class)
                ->whereIn('followable_id', $posts->pluck('user_id'))
                ->pluck('followable_id')
                ->flip();

            $posts->through(function (DiscussionPost $post) use ($likedIds, $followingUserIds) {
                $post->setAttribute('is_liked', $likedIds->has($post->id));
                $post->user->setAttribute('is_following', $followingUserIds->has($post->user_id));
                return $post;
            });
        } else {
            $posts->through(function (DiscussionPost $post) {
                $post->setAttribute('is_liked', false);
                $post->user->setAttribute('is_following', false);
                return $post;
            });
        }

        return $posts;
    }

    public function getUserPosts(int $userId, ?User $authUser, int $perPage = 15): LengthAwarePaginator
    {
        $posts = DiscussionPost::with(['user.profile', 'images'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate($perPage);

        if ($authUser) {
            $likedIds = DiscussionLike::where('user_id', $authUser->id)
                ->whereIn('post_id', $posts->pluck('id'))
                ->pluck('post_id')
                ->flip();

            $followingUserIds = Follow::where('user_id', $authUser->id)
                ->where('followable_type', User::class)
                ->whereIn('followable_id', $posts->pluck('user_id'))
                ->pluck('followable_id')
                ->flip();

            $posts->through(function (DiscussionPost $post) use ($likedIds, $followingUserIds) {
                $post->setAttribute('is_liked', $likedIds->has($post->id));
                $post->user->setAttribute('is_following', $followingUserIds->has($post->user_id));
                return $post;
            });
        } else {
            $posts->through(function (DiscussionPost $post) {
                $post->setAttribute('is_liked', false);
                $post->user->setAttribute('is_following', false);
                return $post;
            });
        }

        return $posts;
    }

    public function getFollowingPosts(User $authUser, int $perPage = 15): LengthAwarePaginator
    {
        $followingIds = Follow::where('user_id', $authUser->id)
            ->where('followable_type', User::class)
            ->pluck('followable_id');

        $posts = DiscussionPost::with(['user.profile', 'images'])
            ->whereIn('user_id', $followingIds)
            ->latest()
            ->paginate($perPage);

        $likedIds = DiscussionLike::where('user_id', $authUser->id)
            ->whereIn('post_id', $posts->pluck('id'))
            ->pluck('post_id')
            ->flip();

        $followingUserIds = Follow::where('user_id', $authUser->id)
            ->where('followable_type', User::class)
            ->whereIn('followable_id', $posts->pluck('user_id'))
            ->pluck('followable_id')
            ->flip();

        $posts->through(function (DiscussionPost $post) use ($likedIds, $followingUserIds) {
            $post->setAttribute('is_liked', $likedIds->has($post->id));
            $post->user->setAttribute('is_following', $followingUserIds->has($post->user_id));
            return $post;
        });

        return $posts;
    }

    public function getPostBySlug(string $slug, ?User $authUser): DiscussionPost
    {
        $post = DiscussionPost::with(['user.profile', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        $isLiked = $authUser
            ? DiscussionLike::where('user_id', $authUser->id)->where('post_id', $post->id)->exists()
            : false;

        $isFollowing = $authUser
            ? Follow::where('user_id', $authUser->id)
                ->where('followable_id', $post->user_id)
                ->where('followable_type', User::class)
                ->exists()
            : false;

        $post->setAttribute('is_liked', $isLiked);
        $post->user->setAttribute('is_following', $isFollowing);

        return $post;
    }

    public function createPost(User $user, array $data): DiscussionPost
    {
        return DB::transaction(function () use ($user, $data) {
            $post = DiscussionPost::create([
                'user_id' => $user->id,
                'caption' => $data['caption'] ?? null,
                'slug'    => Str::slug(now()->format('YmdHis') . '-' . Str::random(6)),
            ]);

            foreach ($data['images'] as $index => $file) {
                $path = $file->store('discussion_posts/' . $post->id, 'public');

                DiscussionPostImage::create([
                    'post_id'    => $post->id,
                    'image_path' => $path,
                    'order'      => $index,
                ]);
            }

            return $post->load(['user.profile', 'images']);
        });
    }

    public function updatePost(User $user, DiscussionPost $post, array $data): DiscussionPost
    {
        if ($post->user_id !== $user->id) {
            throw new \Exception('Unauthorized: you do not own this post.', 403);
        }

        return DB::transaction(function () use ($post, $data) {
            if (array_key_exists('caption', $data)) {
                $post->update(['caption' => $data['caption']]);
            }

            if (!empty($data['images'])) {
                foreach ($post->images as $img) {
                    Storage::disk('public')->delete($img->image_path);
                }
                $post->images()->delete();

                foreach ($data['images'] as $index => $file) {
                    $path = $file->store('discussion_posts/' . $post->id, 'public');
                    DiscussionPostImage::create([
                        'post_id'    => $post->id,
                        'image_path' => $path,
                        'order'      => $index,
                    ]);
                }
            }

            return $post->load(['user.profile', 'images']);
        });
    }

    public function deletePost(User $user, DiscussionPost $post): void
    {
        if ($post->user_id !== $user->id) {
            throw new \Exception('Unauthorized: you do not own this post.', 403);
        }

        DB::transaction(function () use ($post) {
            foreach ($post->images as $img) {
                Storage::disk('public')->delete($img->image_path);
            }
            $post->delete();
        });
    }
}
