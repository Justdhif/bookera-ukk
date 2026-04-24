<?php

namespace App\Services\Favorite;

use App\Models\BookFavorite;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FavoriteService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = BookFavorite::with([
            'book' => function ($q) {
                $q->with(['authors', 'publishers', 'categories', 'genres', 'reviews.user.profile', 'copies']);
            }
        ])
            ->where('user_id', auth()->id());

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('book', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhereHas('authors', function ($aq) use ($search) {
                      $aq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['category_id'])) {
            $categoryId = $filters['category_id'];
            $query->whereHas('book.categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        if (isset($filters['rating']) && $filters['rating'] !== '') {
            $rating = (float) $filters['rating'];
            $query->whereHas('book', function ($q) use ($rating) {
                $q->whereIn('id', function ($sub) use ($rating) {
                    $sub->select('book_id')
                        ->from('book_reviews')
                        ->groupBy('book_id');

                    if ($rating == 5) {
                        $sub->havingRaw("AVG(rating) = 5");
                    } else {
                        $sub->havingRaw("AVG(rating) >= ? AND AVG(rating) < ?", [$rating, $rating + 1]);
                    }
                });
            });
        }

        if (isset($filters['min_reviews']) && $filters['min_reviews'] !== '') {
            $query->whereHas('book', function ($q) use ($filters) {
                $q->has('reviews', '>=', (int) $filters['min_reviews']);
            });
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): BookFavorite
    {
        $already = BookFavorite::where('user_id', auth()->id())
            ->where('book_id', $data['book_id'])
            ->exists();

        if ($already) {
            throw new \Exception('Book is already in favorites');
        }

        return BookFavorite::create([
            'user_id' => auth()->id(),
            'book_id' => $data['book_id'],
        ]);
    }

    public function delete(int $bookId): void
    {
        $deleted = BookFavorite::where('user_id', auth()->id())
            ->where('book_id', $bookId)
            ->delete();

        if (!$deleted) {
            throw new \Exception('Book not found in favorites');
        }
    }

    public function check(int $bookId): bool
    {
        return BookFavorite::where('user_id', auth()->id())
            ->where('book_id', $bookId)
            ->exists();
    }
}
