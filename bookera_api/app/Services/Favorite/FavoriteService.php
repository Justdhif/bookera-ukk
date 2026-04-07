<?php

namespace App\Services\Favorite;

use App\Models\BookFavorite;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FavoriteService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = BookFavorite::with(['book.authors', 'book.publishers', 'book.categories', 'book.reviews.user.profile'])
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

        // Apply sorting (newest favorites first)
        $query->latest('id');

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): BookFavorite
    {
        $already = BookFavorite::where('user_id', auth()->id())
            ->where('book_id', $data['book_id'])
            ->exists();

        if ($already) {
            throw new \Exception('Buku sudah ada di favorit');
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
            throw new \Exception('Buku tidak ditemukan di favorit');
        }
    }

    public function check(int $bookId): bool
    {
        return BookFavorite::where('user_id', auth()->id())
            ->where('book_id', $bookId)
            ->exists();
    }
}
