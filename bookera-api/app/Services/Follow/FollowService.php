<?php

namespace App\Services\Follow;

use App\Models\Author;
use App\Models\Follow;
use App\Models\Publisher;
use Illuminate\Support\Facades\Auth;

class FollowService
{
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

    public function follow(string $type, int $id): Follow
    {
        $modelClass = $type === 'author' ? Author::class : Publisher::class;

        $model = $modelClass::findOrFail($id);

        $follow = Follow::firstOrCreate([
            'user_id'         => Auth::id(),
            'followable_id'   => $model->id,
            'followable_type' => $modelClass,
        ]);

        return $follow;
    }

    public function unfollow(string $type, int $id): bool
    {
        $modelClass = $type === 'author' ? Author::class : Publisher::class;

        return Follow::where('user_id', Auth::id())
            ->where('followable_id', $id)
            ->where('followable_type', $modelClass)
            ->delete() > 0;
    }

    public function isFollowing(string $type, int $id): bool
    {
        $modelClass = $type === 'author' ? Author::class : Publisher::class;

        return Follow::where('user_id', Auth::id())
            ->where('followable_id', $id)
            ->where('followable_type', $modelClass)
            ->exists();
    }

    public function getFollowedAuthorDetail(string $slug): ?Author
    {
        $author = Author::with(['books' => function ($q) {
            $q->with(['categories'])
              ->withCount(['copies as available_copies' => function ($q) {
                  $q->where('status', 'available');
              }]);
        }])->where('slug', $slug)->first();

        if (!$author) {
            return null;
        }

        $author->photo_url = storage_image($author->photo);
        $author->is_following = $this->isFollowing('author', $author->id);

        $author->books->transform(function ($book) {
            $book->cover_image_url = storage_image($book->cover_image);
            return $book;
        });

        return $author;
    }

    public function getFollowedPublisherDetail(string $slug): ?Publisher
    {
        $publisher = Publisher::with(['books' => function ($q) {
            $q->with(['categories'])
              ->withCount(['copies as available_copies' => function ($q) {
                  $q->where('status', 'available');
              }]);
        }])->where('slug', $slug)->first();

        if (!$publisher) {
            return null;
        }

        $publisher->photo_url = storage_image($publisher->photo);
        $publisher->is_following = $this->isFollowing('publisher', $publisher->id);

        $publisher->books->transform(function ($book) {
            $book->cover_image_url = storage_image($book->cover_image);
            return $book;
        });

        return $publisher;
    }
}
