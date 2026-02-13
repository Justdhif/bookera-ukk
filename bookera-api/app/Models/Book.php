<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $slug
 * @property string $title
 * @property string|null $isbn
 * @property string|null $description
 * @property string $author
 * @property string|null $publisher
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Save> $saves
 * @property-read int|null $saves_count
 */
class Book extends Model
{
    protected $table = 'books';

    protected $fillable = [
        'slug',
        'title',
        'isbn',
        'description',
        'author',
        'publisher',
        'publication_year',
        'language',
        'cover_image',
        'is_active',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_categories', 'book_id', 'category_id');
    }

    public function copies()
    {
        return $this->hasMany(BookCopy::class);
    }

    public function saves()
    {
        return $this->belongsToMany(Save::class, 'save_items')
            ->withTimestamps();
    }
}
