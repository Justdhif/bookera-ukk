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

    protected $withCount = ['books'];

    public function getPhotoAttribute($value)
    {
        if ($value) {
            return storage_image($value);
        }

        return 'https://picsum.photos/seed/'.rawurlencode($this->slug).'/400/400';
    }

    public function setPhotoAttribute($value)
    {
        $this->attributes['photo'] = $value;
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
