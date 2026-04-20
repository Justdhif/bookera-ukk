<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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
        'price' => 'float',
        'is_active' => 'boolean',
    ];

    protected $withCount = ['favorites', 'total_copies', 'available_copies'];

    protected $appends = ['author', 'publisher', 'average_rating', 'reviews_count', 'total_copies', 'available_copies'];

    public function getCoverImageAttribute($value)
    {
        if ($value) {
            return storage_image($value);
        }

        return 'https://picsum.photos/seed/'.rawurlencode($this->slug).'/400/600';
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

    public function getTotalCopiesAttribute()
    {
        return $this->total_copies_count ?? 0;
    }

    public function getAvailableCopiesAttribute()
    {
        return $this->available_copies_count ?? 0;
    }

    public function reviews()
    {
        return $this->hasMany(BookReview::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_categories', 'book_id', 'category_id');
    }

    public function copies()
    {
        return $this->hasMany(BookCopy::class);
    }

    public function favorites()
    {
        return $this->hasMany(BookFavorite::class);
    }

    public function total_copies()
    {
        return $this->hasMany(BookCopy::class);
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
}
