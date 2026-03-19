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
    public function getAll(?User $authUser, int $perPage = 15): LengthAwarePaginator
    {
        $posts = DiscussionPost::with(['user.profile', 'images'])
            ->withCount(['likes', 'comments'])
            ->notTakenDown()
            ->latest()
            ->paginate($perPage);

        return $this->attachAuthDataToPosts($posts, $authUser);
    }

    public function getByUser(string $userSlug, ?User $authUser, int $perPage = 15): LengthAwarePaginator
    {
        $targetUser = User::where('slug', $userSlug)->firstOrFail();

        $posts = DiscussionPost::with(['user.profile', 'images'])
            ->withCount(['likes', 'comments'])
            ->where('user_id', $targetUser->id)
            ->notTakenDown()
            ->latest()
            ->paginate($perPage);

        return $this->attachAuthDataToPosts($posts, $authUser);
    }

    public function getByFollowing(User $authUser, int $perPage = 15): LengthAwarePaginator
    {
        $followingIds = Follow::where('user_id', $authUser->id)
            ->where('followable_type', User::class)
            ->pluck('followable_id');

        $posts = DiscussionPost::with(['user.profile', 'images'])
            ->withCount(['likes', 'comments'])
            ->whereIn('user_id', $followingIds)
            ->notTakenDown()
            ->latest()
            ->paginate($perPage);

        return $this->attachAuthDataToPosts($posts, $authUser);
    }

    public function getBySlug(string $slug, ?User $authUser): DiscussionPost
    {
        $post = DiscussionPost::with(['user.profile', 'images'])
            ->withCount(['likes', 'comments'])
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

        $followedLikers = collect();
        if ($authUser) {
            $followingIds = Follow::where('user_id', $authUser->id)
                ->where('followable_type', User::class)
                ->pluck('followable_id');

            $followedLikers = DiscussionLike::with('user.profile')
                ->where('post_id', $post->id)
                ->whereIn('user_id', $followingIds)
                ->latest()
                ->take(3)
                ->get()
                ->map(fn ($like) => $like->user);
        }

        $post->setAttribute('is_liked', $isLiked);
        $post->user->setAttribute('is_following', $isFollowing);
        $post->setAttribute('followed_likers', $followedLikers);

        return $post;
    }

    public function create(User $user, array $data): DiscussionPost
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

    public function update(User $user, DiscussionPost $post, array $data): DiscussionPost
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

    public function delete(User $user, DiscussionPost $post): void
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

    private function attachAuthDataToPosts(LengthAwarePaginator $posts, ?User $authUser): LengthAwarePaginator
    {
        if ($authUser && $posts->count() > 0) {
            $likedIds = DiscussionLike::where('user_id', $authUser->id)
                ->whereIn('post_id', $posts->pluck('id'))
                ->pluck('post_id')
                ->flip();

            $followingUserIdsArray = Follow::where('user_id', $authUser->id)
                ->where('followable_type', User::class)
                ->pluck('followable_id')
                ->toArray();
                
            $followingUserIds = collect($followingUserIdsArray)->flip();

            // Load likes from followed users
            $posts->load(['likes' => function ($query) use ($followingUserIdsArray) {
                $query->whereIn('user_id', $followingUserIdsArray)
                    ->with('user.profile')
                    ->latest();
            }]);

            $posts->through(function (DiscussionPost $post) use ($likedIds, $followingUserIds) {
                $post->setAttribute('is_liked', $likedIds->has($post->id));
                $post->user->setAttribute('is_following', $followingUserIds->has($post->user_id));
                
                // Get up to 3 followed likers
                $followedLikers = $post->likes->take(3)->map(fn ($like) => $like->user);
                $post->setAttribute('followed_likers', $followedLikers);
                
                // Unset the full likes relation to avoid sending too much data
                $post->unsetRelation('likes');
                
                return $post;
            });
        } else {
            $posts->through(function (DiscussionPost $post) {
                $post->setAttribute('is_liked', false);
                $post->user->setAttribute('is_following', false);
                $post->setAttribute('followed_likers', collect());
                return $post;
            });
        }

        return $posts;
    }
}
