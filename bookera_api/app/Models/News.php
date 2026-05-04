<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class News extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'title',
        'slug',
        'content',
        'image',
    ];

    /**
     * Get the admin that authored the news.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the comments for the news.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(NewsComment::class)->whereNull('parent_id')->latest();
    }

    /**
     * Get all comments including replies.
     */
    public function allComments(): HasMany
    {
        return $this->hasMany(NewsComment::class);
    }

    /**
     * Get the news image URL.
     */
    public function getImageAttribute($value)
    {
        if ($value) {
            return storage_image($value);
        }
        return null;
    }
}
