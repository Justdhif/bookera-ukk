<?php

namespace App\Models;

use App\Models\Genre;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $table = 'books';

    protected $fillable = [
        'slug',
        'title',
        'isbn',
        'description',
        'publication_year',
        'language',
        'cover_image',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $withCount = ['favorites', 'available_copies'];
    protected $appends = ['average_rating', 'reviews_count', 'author', 'publisher', 'available_copies', 'total_copies'];

    public function getCoverImageAttribute($value)
    {
        if ($value) {
            return storage_image($value);
        }

        return asset('images/default_cover.jpg');
    }

    public function setCoverImageAttribute($value)
    {
        $this->attributes['cover_image'] = $value;
    }

    public function getAuthorAttribute()
    {
        return $this->authors->pluck('name')->join(', ');
    }

    public function getPublisherAttribute()
    {
        return $this->publishers->pluck('name')->join(', ');
    }

    public function getAverageRatingAttribute()
    {
        if ($this->relationLoaded('reviews')) {
            $avg = $this->reviews->avg('rating');
            return $avg !== null ? round($avg, 1) : 0;
        }
        return 0;
    }

    public function getReviewsCountAttribute()
    {
        if ($this->relationLoaded('reviews')) {
            return $this->reviews->count();
        }
        return 0;
    }


    public function getAvailableCopiesAttribute()
    {
        // 1. Get raw available copies count (status = 'available')
        $rawCount = array_key_exists('available_copies_count', $this->attributes)
            ? (int) $this->available_copies_count
            : $this->available_copies()->count();

        // 2. Get active reservations count (notified + waiting) for this book
        $activeReservationsCount = $this->reservations()
            ->whereIn('status', ['notified', 'waiting'])
            ->count();

        // 3. Public available count (available for people NOT in the queue)
        $publicAvailable = max(0, $rawCount - $activeReservationsCount);

        // 4. If user is logged in, check if they have a 'notified' reservation for THIS book
        $user = auth('sanctum')->user();
        if ($user) {
            $hasNotified = $this->reservations()
                ->where('user_id', $user->id)
                ->where('status', 'notified')
                ->exists();

            if ($hasNotified) {
                // Notified user gets to see their reserved copy
                return $publicAvailable + 1;
            }
        }

        return $publicAvailable;
    }

    public function getTotalCopiesAttribute()
    {
        if (array_key_exists('total_copies_count', $this->attributes)) {
            return $this->total_copies_count;
        }
        return $this->copies()->count();
    }

    public function reviews()
    {
        return $this->hasMany(BookReview::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_categories', 'book_id', 'category_id');
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'book_genres', 'book_id', 'genre_id');
    }

    public function copies()
    {
        return $this->hasMany(BookCopy::class);
    }

    public function favorites()
    {
        return $this->hasMany(BookFavorite::class);
    }


    public function available_copies()
    {
        return $this->hasMany(BookCopy::class)->where('status', 'available');
    }

    public function authors()
    {
        return $this->belongsToMany(Author::class, 'book_authors', 'book_id', 'author_id')
            ->withTimestamps();
    }

    public function publishers()
    {
        return $this->belongsToMany(Publisher::class, 'book_publishers', 'book_id', 'publisher_id')
            ->withTimestamps();
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

}
