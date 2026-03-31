<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $slug
 * @property string $title
 * @property string|null $isbn
 * @property string|null $description
 * @property int|null $publication_year
 * @property string|null $language
 * @property string|null $cover_image
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BookCopy> $copies
 * @property-read int|null $copies_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BookFavorite> $favorites
 * @property-read int|null $favorites_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Author> $authors
 * @property-read int|null $authors_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Publisher> $publishers
 * @property-read int|null $publishers_count
 */
class Book extends Model
{
    /** @use HasFactory<\Database\Factories\BookFactory> */
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
        'is_active',
    ];

    protected $appends = ['author', 'publisher', 'average_rating', 'reviews_count'];

    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value) {
                    return storage_image($value);
                }

                return 'https://picsum.photos/seed/'.rawurlencode($this->slug).'/400/600';
            },
            set: fn ($value) => $value,
        );
    }

    protected function author(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->authors->pluck('name')->join(', '),
        );
    }

    protected function publisher(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->publishers->pluck('name')->join(', '),
        );
    }

    protected function averageRating(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->relationLoaded('reviews')) {
                    $avg = $this->reviews->avg('rating');
                    return $avg !== null ? round($avg, 1) : 0;
                }
                return 0;
            }
        );
    }

    protected function reviewsCount(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->relationLoaded('reviews')) {
                    return $this->reviews->count();
                }
                return 0;
            }
        );
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
