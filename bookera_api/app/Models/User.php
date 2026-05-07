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

    protected $appends = ['has_pending_borrow_request', 'has_overdue_borrow', 'active_membership'];

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

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
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



    public function favoriteBooks()
    {
        return $this->belongsToMany(Book::class, 'book_favorites', 'user_id', 'book_id')
            ->withTimestamps();
    }

    public function borrowRequests()
    {
        return $this->hasMany(BorrowRequest::class);
    }

    public function getHasPendingBorrowRequestAttribute(): bool
    {
        return $this->borrowRequests()
            ->where('approval_status', '!=', 'canceled')
            ->whereHas('borrowRequestDetails', function ($query) {
                $query->where('approval_status', 'processing');
            })
            ->exists();
    }

    public function borrows()
    {
        return $this->hasMany(Borrow::class);
    }

    public function getHasOverdueBorrowAttribute(): bool
    {
        return $this->borrows()
            ->where('status', 'open')
            ->whereDate('return_date', '<', now()->toDateString())
            ->exists();
    }

    public function membership()
    {
        return $this->hasOne(Membership::class);
    }

    public function getActiveMembershipAttribute()
    {
        return $this->membership()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
