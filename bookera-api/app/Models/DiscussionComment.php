<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property int $post_id
 * @property int|null $parent_id
 * @property string $content
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\User $user
 * @property-read \App\Models\DiscussionPost $post
 * @property-read \App\Models\DiscussionComment|null $parent
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\DiscussionComment> $replies
 */
class DiscussionComment extends Model
{
    protected $table = 'discussion_comments';

    protected $fillable = [
        'user_id',
        'post_id',
        'parent_id',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(DiscussionPost::class, 'post_id');
    }

    public function parent()
    {
        return $this->belongsTo(DiscussionComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(DiscussionComment::class, 'parent_id')->with('user.profile')->latest();
    }
}
