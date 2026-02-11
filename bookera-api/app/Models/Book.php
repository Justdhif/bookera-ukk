<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
