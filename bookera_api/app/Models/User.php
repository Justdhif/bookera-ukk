<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'slug',
        'password',
        'role',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function discussionPosts()
    {
        return $this->hasMany(DiscussionPost::class);
    }

    public function discussionLikes()
    {
        return $this->hasMany(DiscussionLike::class);
    }

    public function discussionComments()
    {
        return $this->hasMany(DiscussionComment::class);
    }

    /** Users that follow this user */
    public function followers()
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    /** Users that this user follows */
    public function following()
    {
        return $this->hasMany(Follow::class, 'user_id')->where('followable_type', self::class);
    }

    /** Discussion Post Reports created by this user */
    public function reportedPosts()
    {
        return $this->hasMany(DiscussionPostReport::class, 'reporter_id');
    }

    /** Discussion Post Reports reviewed by this admin/user */
    public function reviewedReports()
    {
        return $this->hasMany(DiscussionPostReport::class, 'reviewed_by');
    }

    public function favoriteBooks()
    {
        return $this->belongsToMany(Book::class, 'book_favorites', 'user_id', 'book_id')
            ->withTimestamps();
    }
}
