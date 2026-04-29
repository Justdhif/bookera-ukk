<?php

namespace App\Services\Public;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Complaint;
use App\Models\DiscussionPost;
use App\Models\Publisher;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PublicService
{
    public function getAllBooks(array $filters): LengthAwarePaginator
    {
        $query = Book::query()
            ->with([
                'categories',
                'genres',
                'authors',
                'publishers',
                'reviews.user.profile',
                'copies' => function ($query) {
                    $query->where('status', 'available');
                }
            ]);

        // Include both total and available counts
        $query->withCount([
            'favorites',
            'copies as total_copies_count',
            'available_copies as available_copies_count',
            'reviews'
        ]);

        $query->where('is_active', true);

        // Removed: Always filter by available stock for public listing
        // $query->whereHas('copies', function ($copyQuery) {
        //     $copyQuery->where('status', 'available');
        // });

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('title', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%")
                    ->orWhereHas('authors', function ($authorQuery) use ($search) {
                        $authorQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('publishers', function ($publisherQuery) use ($search) {
                        $publisherQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['category_ids'])) {
            $categoryIds = is_array($filters['category_ids'])
                ? $filters['category_ids']
                : explode(',', $filters['category_ids']);

            $query->whereHas('categories', function ($categoryQuery) use ($categoryIds) {
                $categoryQuery->whereIn('categories.id', $categoryIds);
            });
        }

        if (!empty($filters['genre_ids'])) {
            $genreIds = is_array($filters['genre_ids'])
                ? $filters['genre_ids']
                : explode(',', $filters['genre_ids']);

            $query->whereHas('genres', function ($genreQuery) use ($genreIds) {
                $genreQuery->whereIn('genres.id', $genreIds);
            });
        }

        if (isset($filters['rating']) && $filters['rating'] !== '') {
            $rating = (float) $filters['rating'];
            $query->whereIn('id', function ($q) use ($rating) {
                $q->select('book_id')
                    ->from('book_reviews')
                    ->groupBy('book_id');

                if ($rating == 5) {
                    $q->havingRaw("AVG(rating) = 5");
                } else {
                    $q->havingRaw("AVG(rating) >= ? AND AVG(rating) < ?", [$rating, $rating + 1]);
                }
            });
        }

        if (isset($filters['min_reviews']) && $filters['min_reviews'] !== '') {
            $query->has('reviews', '>=', (int) $filters['min_reviews']);
        }

        if (!empty($filters['author_ids'])) {
            $authorIds = is_array($filters['author_ids'])
                ? $filters['author_ids']
                : explode(',', $filters['author_ids']);

            $query->whereHas('authors', function ($authorQuery) use ($authorIds) {
                $authorQuery->whereIn('authors.id', $authorIds);
            });
        }

        if (!empty($filters['publisher_ids'])) {
            $publisherIds = is_array($filters['publisher_ids'])
                ? $filters['publisher_ids']
                : explode(',', $filters['publisher_ids']);

            $query->whereHas('publishers', function ($publisherQuery) use ($publisherIds) {
                $publisherQuery->whereIn('publishers.id', $publisherIds);
            });
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }



    public function getBookBySlug(string $slug): ?Book
    {
        $book = Book::where('slug', $slug)
            ->where('is_active', true)
            ->withCount([
                'favorites',
                'copies as total_copies_count',
                'available_copies as available_copies_count',
                'reviews'
            ])
            ->first();

        if (!$book) {
            return null;
        }

        return $this->loadBookDetails($book);
    }

    public function getBookById(int $id): ?Book
    {
        $book = Book::where('id', $id)
            ->where('is_active', true)
            ->withCount([
                'favorites',
                'copies as total_copies_count',
                'available_copies as available_copies_count',
                'reviews'
            ])
            ->first();

        if (!$book) {
            return null;
        }

        return $this->loadBookDetails($book);
    }

    private function loadBookDetails(Book $book): Book
    {
        $book->load([
            'categories',
            'genres',
            'authors',
            'publishers',
            'reviews.user.profile',
            'copies' => function ($query) {
                $query->where('status', 'available')->orderBy('created_at');
            }
        ]);

        $book->authors->each(function ($author) {
            $author->photo_url = storage_image($author->photo);
        });

        $book->publishers->each(function ($publisher) {
            $publisher->photo_url = storage_image($publisher->photo);
        });

        return $book;
    }


    public function getAllAuthors(array $filters): LengthAwarePaginator
    {
        $query = Author::query()
            ->where('is_active', true)
            ->latest()
            ->orderByDesc('id');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }



    public function getAuthorBySlug(string $slug): ?Author
    {
        $author = Author::query()
            ->where('slug', $slug)
            ->first();

        if (!$author || !$author->is_active) {
            return null;
        }

        return $author;
    }

    public function getAllPublishers(array $filters): LengthAwarePaginator
    {
        $query = Publisher::query()
            ->where('is_active', true)
            ->latest()
            ->orderByDesc('id');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }



    public function getPublisherBySlug(string $slug): ?Publisher
    {
        $publisher = Publisher::query()
            ->where('slug', $slug)
            ->first();

        if (!$publisher || !$publisher->is_active) {
            return null;
        }

        return $publisher;
    }

    public function getAllCategories(array $filters): LengthAwarePaginator
    {
        $query = Category::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }

    public function getAllUsers(array $filters): LengthAwarePaginator
    {
        $query = User::query()
            ->with(['profile'])
            ->where('is_active', true)
            ->where('role', 'user');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhereHas('profile', function ($pq) use ($search) {
                        $pq->where('full_name', 'like', "%{$search}%")
                            ->orWhere('bio', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function getTopDiscussions(int $limit = 10): Collection
    {
        return DiscussionPost::query()
            ->notTakenDown()
            ->with(['user.profile', 'images'])
            ->orderByDesc('likes_count')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function getAllDiscussions(int $perPage = 12, ?string $search = null)
    {
        $query = DiscussionPost::query()
            ->notTakenDown()
            ->with(['user.profile', 'images'])
            ->orderByDesc('created_at');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('caption', 'like', "%{$search}%")
                    ->orWhereHas('user.profile', function ($uq) use ($search) {
                        $uq->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get public statistics for the landing page.
     * Returns total books, total users, top rated books, recent discussions, and recent complaints.
     */
    public function getPublicStats(): array
    {
        $totalBooks = Book::where('is_active', true)->count();
        $totalUsers = User::where('is_active', true)->where('role', 'user')->count();

        // Top rated books: avg rating (min 1 review), load with categories and authors
        $topRatedBooks = Book::query()
            ->where('is_active', true)
            ->with(['authors', 'categories', 'reviews'])
            ->withCount(['reviews', 'favorites'])
            ->withAvg('reviews', 'rating')
            ->having('reviews_avg_rating', '>=', 1)
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('reviews_count')
            ->limit(6)
            ->get()
            ->map(function ($book) {
                return [
                    'id'             => $book->id,
                    'title'          => $book->title,
                    'slug'           => $book->slug,
                    'cover_image'    => $book->cover_image,
                    'author'         => $book->author,
                    'average_rating' => round((float) $book->reviews_avg_rating, 1),
                    'reviews_count'  => $book->reviews_count,
                    'favorites_count'=> $book->favorites_count,
                    'categories'     => $book->categories->pluck('name'),
                ];
            });

        // Recent discussions (top 4)
        $recentDiscussions = DiscussionPost::query()
            ->notTakenDown()
            ->with(['user.profile'])
            ->orderByDesc('likes_count')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(function ($d) {
                return [
                    'id'             => $d->id,
                    'slug'           => $d->slug,
                    'caption'        => $d->caption,
                    'likes_count'    => $d->likes_count,
                    'comments_count' => $d->comments_count,
                    'created_at'     => $d->created_at,
                    'user_name'      => optional(optional($d->user)->profile)->full_name ?? 'Anonymous',
                    'user_avatar'    => optional(optional($d->user)->profile)->avatar,
                ];
            });

        // Recent complaints (resolved ones, up to 4)
        $recentComplaints = Complaint::query()
            ->with(['user.profile'])
            ->where('status', 'resolved')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(function ($c) {
                return [
                    'id'       => $c->id,
                    'slug'     => $c->slug,
                    'title'    => $c->title,
                    'category' => $c->category,
                    'status'   => $c->status,
                    'created_at' => $c->created_at,
                ];
            });

        return [
            'total_books'        => $totalBooks,
            'total_users'        => $totalUsers,
            'top_rated_books'    => $topRatedBooks,
            'recent_discussions' => $recentDiscussions,
            'recent_complaints'  => $recentComplaints,
        ];
    }
}
