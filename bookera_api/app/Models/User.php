<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $email
 * @property string $password
 * @property string $role
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property \Illuminate\Support\Carbon|null $last_login_at
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\UserProfile|null $profile
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\Notification> $notifications
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Book> $favoriteBooks
 * @property-read int|null $favorite_books_count
 */
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
