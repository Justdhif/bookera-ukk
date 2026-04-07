<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publisher extends Model
{
    use HasFactory;

    protected $table = 'publishers';

    protected $fillable = [
        'slug',
        'name',
        'description',
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
        return $this->belongsToMany(Book::class, 'book_publishers', 'publisher_id', 'book_id')
            ->withTimestamps();
    }

    public function followers()
    {
        return $this->morphMany(Follow::class, 'followable');
    }
}
