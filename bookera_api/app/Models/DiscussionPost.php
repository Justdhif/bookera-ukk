<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $caption
 * @property string $slug
 * @property int $likes_count
 * @property int $comments_count
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\DiscussionPostImage> $images
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\DiscussionLike> $likes
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\DiscussionComment> $comments
 */
class DiscussionPost extends Model
{
    use HasFactory;

    protected $table = 'discussion_posts';

    protected $fillable = [
        'user_id',
        'caption',
        'slug',
        'likes_count',
        'comments_count',
        'taken_down_at',
        'taken_down_reason',
    ];

    protected $casts = [
        'taken_down_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (DiscussionPost $post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug(now()->format('Y-m-d-H-i-s').'-'.Str::random(6));
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(DiscussionPostImage::class, 'post_id')->orderBy('order');
    }

    public function likes()
    {
        return $this->hasMany(DiscussionLike::class, 'post_id');
    }

    public function comments()
    {
        return $this->hasMany(DiscussionComment::class, 'post_id');
    }

    public function reports()
    {
        return $this->hasMany(DiscussionPostReport::class, 'post_id');
    }

    public function scopeNotTakenDown(Builder $query): Builder
    {
        return $query->whereNull('taken_down_at');
    }
}
