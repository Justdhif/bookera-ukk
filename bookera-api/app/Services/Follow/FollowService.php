<?php

namespace App\Services\Follow;

use App\Models\Author;
use App\Models\Follow;
use App\Models\Notification;
use App\Models\Publisher;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class FollowService
{
    private function resolveModel(string $type): string
    {
        return match ($type) {
            'author'    => Author::class,
            'publisher' => Publisher::class,
            'user'      => User::class,
            default     => throw new \InvalidArgumentException("Tipe tidak dikenal: {$type}"),
        };
    }

    public function getFollowedAuthors(): array
    {
        $follows = Follow::with('followable')
            ->where('user_id', Auth::id())
            ->where('followable_type', Author::class)
            ->latest()
            ->get();

        return $follows->map(function ($follow) {
            $author = $follow->followable;
            if ($author) {
                $author->photo_url = storage_image($author->photo);
                $author->follow_id = $follow->id;
                $author->books_count = $author->books()->count();
            }
            return $author;
        })->filter()->values()->all();
    }

    public function getFollowedPublishers(): array
    {
        $follows = Follow::with('followable')
            ->where('user_id', Auth::id())
            ->where('followable_type', Publisher::class)
            ->latest()
            ->get();

        return $follows->map(function ($follow) {
            $publisher = $follow->followable;
            if ($publisher) {
                $publisher->photo_url = storage_image($publisher->photo);
                $publisher->follow_id = $follow->id;
                $publisher->books_count = $publisher->books()->count();
            }
            return $publisher;
        })->filter()->values()->all();
    }

    public function getFollowedUsers(): array
    {
        $follows = Follow::with('followable.profile')
            ->where('user_id', Auth::id())
            ->where('followable_type', User::class)
            ->latest()
            ->get();

        return $follows->map(function ($follow) {
            $user = $follow->followable;
            if ($user) {
                $user->follow_id = $follow->id;
                if ($user->profile) {
                    $user->profile->avatar_url = storage_image($user->profile->avatar);
                }
            }
            return $user;
        })->filter()->values()->all();
    }

    public function follow(string $type, int $id): Follow
    {
        $modelClass = $this->resolveModel($type);
        $model = $modelClass::findOrFail($id);

        if ($type === 'user' && $model->id === Auth::id()) {
            throw new \Exception('Kamu tidak bisa mengikuti dirimu sendiri.', 422);
        }

        $follow = Follow::firstOrCreate([
            'user_id'         => Auth::id(),
            'followable_id'   => $model->id,
            'followable_type' => $modelClass,
        ]);

        if ($type === 'user' && $follow->wasRecentlyCreated) {
            $follower = Auth::user();
            $actorName = $follower->profile?->full_name ?? $follower->email;

            Notification::create([
                'user_id' => $model->id,
                'title'   => 'Pengikut baru',
                'message' => "{$actorName} mulai mengikutimu.",
                'type'    => 'new_follower',
                'module'  => 'discussion',
                'data'    => ['actor_id' => Auth::id()],
            ]);
        }

        return $follow;
    }

    public function unfollow(string $type, int $id): bool
    {
        $modelClass = $this->resolveModel($type);

        return Follow::where('user_id', Auth::id())
            ->where('followable_id', $id)
            ->where('followable_type', $modelClass)
            ->delete() > 0;
    }

    public function isFollowing(string $type, int $id): bool
    {
        $modelClass = $this->resolveModel($type);

        return Follow::where('user_id', Auth::id())
            ->where('followable_id', $id)
            ->where('followable_type', $modelClass)
            ->exists();
    }

    public function getUserFollowers(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Follow::with('user.profile')
            ->where('followable_id', $userId)
            ->where('followable_type', User::class)
            ->latest()
            ->paginate($perPage)
            ->through(function (Follow $follow) {
                if ($follow->user?->profile) {
                    $follow->user->profile->avatar_url = storage_image($follow->user->profile->avatar);
                }
                return $follow;
            });
    }

    public function getUserFollowing(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Follow::with('followable.profile')
            ->where('user_id', $userId)
            ->where('followable_type', User::class)
            ->latest()
            ->paginate($perPage)
            ->through(function (Follow $follow) {
                if ($follow->followable?->profile) {
                    $follow->followable->profile->avatar_url = storage_image($follow->followable->profile->avatar);
                }
                return $follow;
            });
    }

    public function getUserFollowCounts(int $userId): array
    {
        return [
            'followers_count' => Follow::where('followable_id', $userId)
                ->where('followable_type', User::class)
                ->count(),
            'following_count' => Follow::where('user_id', $userId)
                ->where('followable_type', User::class)
                ->count(),
        ];
    }

    public function getFollowableDetail(string $type, string $slug): Author|Publisher|null
    {
        $modelClass = $type === 'author' ? Author::class : Publisher::class;

        $model = $modelClass::with(['books' => function ($q) {
            $q->with(['categories'])
              ->withCount(['copies as available_copies' => function ($q) {
                  $q->where('status', 'available');
              }]);
        }])->where('slug', $slug)->first();

        if (!$model) {
            return null;
        }

        $model->photo_url = storage_image($model->photo);
        $model->is_following = $this->isFollowing($type, $model->id);

        $model->books->transform(function ($book) {
            $book->cover_image_url = storage_image($book->cover_image);
            return $book;
        });

        return $model;
    }
}
