<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionComment extends Model
{
    use HasFactory;

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
