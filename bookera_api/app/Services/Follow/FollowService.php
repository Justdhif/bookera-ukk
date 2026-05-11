<?php

namespace App\Services\Follow;

use App\Models\Follow;
use App\Notifications\GeneralNotification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class FollowService
{
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
        $model = User::findOrFail($id);

        if ($model->id === Auth::id()) {
            throw new \Exception(__('You cannot follow yourself.'), 422);
        }

        $follow = Follow::firstOrCreate([
            'user_id'         => Auth::id(),
            'followable_id'   => $model->id,
            'followable_type' => User::class,
        ]);

        if ($follow->wasRecentlyCreated) {
            $follower  = Auth::user();
            $actorName = $follower->profile?->full_name ?? $follower->email;

            $model->notify(new GeneralNotification(
                __('New follower'),
                __(':name started following you.', ['name' => $actorName]),
                'new_follower',
                'discussion',
                ['actor_id' => Auth::id()]
            ));
        }

        return $follow;
    }

    public function unfollow(int $id): bool
    {
        return Follow::where('user_id', Auth::id())
            ->where('followable_id', $id)
            ->where('followable_type', User::class)
            ->delete() > 0;
    }

    public function isFollowing(int $id): bool
    {
        return Follow::where('user_id', Auth::id())
            ->where('followable_id', $id)
            ->where('followable_type', User::class)
            ->exists();
    }

    public function getUserFollowers(string $userSlug, int $perPage = 20): LengthAwarePaginator
    {
        $targetUser = $this->resolveUser($userSlug);

        return Follow::with('user.profile')
            ->where('followable_id', $targetUser->id)
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

    public function getUserFollowing(string $userSlug, int $perPage = 20): LengthAwarePaginator
    {
        $targetUser = $this->resolveUser($userSlug);

        return Follow::with('followable.profile')
            ->where('user_id', $targetUser->id)
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

    public function getUserFollowCounts(string $userSlug): array
    {
        $targetUser = $this->resolveUser($userSlug);

        return [
            'followers_count' => Follow::where('followable_id', $targetUser->id)
                ->where('followable_type', User::class)
                ->count(),
            'following_count' => Follow::where('user_id', $targetUser->id)
                ->where('followable_type', User::class)
                ->count(),
        ];
    }

    private function resolveUser(string $identifier): User
    {
        if ($identifier === 'me' && auth('sanctum')->check()) {
            return auth('sanctum')->user();
        }

        if (is_numeric($identifier)) {
            return User::findOrFail($identifier);
        }

        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return User::where('email', $identifier)->firstOrFail();
        }

        return User::where('slug', $identifier)->firstOrFail();
    }
}
