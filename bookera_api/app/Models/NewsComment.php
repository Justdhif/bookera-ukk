<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'news_id',
        'user_id',
        'parent_id',
        'content',
        'image',
    ];

    /**
     * Get the news that the comment belongs to.
     */
    public function news(): BelongsTo
    {
        return $this->belongsTo(News::class);
    }

    /**
     * Get the user that authored the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment if this is a reply.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(NewsComment::class, 'parent_id');
    }

    /**
     * Get the replies for the comment.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(NewsComment::class, 'parent_id')->latest();
    }

    /**
     * Get the comment image URL.
     */
    public function getImageAttribute($value)
    {
        if ($value) {
            return storage_image($value);
        }
        return null;
    }
}
