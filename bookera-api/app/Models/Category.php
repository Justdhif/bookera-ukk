<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'description',
    ];

    public function books()
    {
        return $this->belongsToMany(Book::class, 'book_categories', 'category_id', 'book_id');
    }
}
