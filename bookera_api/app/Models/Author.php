<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    use HasFactory;

    protected $table = 'authors';

    protected $fillable = [
        'slug',
        'name',
        'bio',
        'photo',
        'is_active',
    ];

    protected function photo(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value) {
                    return storage_image($value);
                }

                return 'https://api.dicebear.com/7.x/initials/png?seed='.rawurlencode($this->name);
            },
            set: fn ($value) => $value,
        );
    }

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
