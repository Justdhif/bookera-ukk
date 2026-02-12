<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Save extends Model
{
    protected $table = 'saves';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'cover',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(SaveItem::class);
    }

    public function books()
    {
        return $this->belongsToMany(Book::class, 'save_items')
            ->withTimestamps();
    }
}
