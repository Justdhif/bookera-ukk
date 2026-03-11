<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string|null $bio
 * @property string $photo
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Book> $books
 * @property-read int|null $books_count
 */
class Author extends Model
{
    /** @use HasFactory<\Database\Factories\AuthorFactory> */
    use HasFactory;

    protected $table = 'authors';

    protected $fillable = [
        'slug',
        'name',
        'bio',
        'photo',
        'is_active',
    ];

    public function books()
    {
        return $this->belongsToMany(Book::class, 'book_authors', 'author_id', 'book_id')
            ->withTimestamps();
    }

    public function followers()
    {
        return $this->morphMany(Follow::class, 'followable');
    }
}
