<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Complaint extends Model
{
    use HasFactory;

    protected $table = 'complaints';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'status',
        'slug',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    protected $withCount = ['votes', 'comments'];

    protected $appends = ['is_priority', 'is_voted'];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(ComplaintImage::class, 'complaint_id')->orderBy('order');
    }

    public function votes()
    {
        return $this->hasMany(ComplaintVote::class, 'complaint_id');
    }

    public function comments()
    {
        return $this->hasMany(ComplaintComment::class, 'complaint_id');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeResolved(Builder $query): Builder
    {
        return $query->where('status', 'resolved');
    }

    public function getIsPriorityAttribute(): bool
    {
        return (bool) ($this->attributes['is_priority'] ?? false);
    }
    public function getIsVotedAttribute(): bool
    {
        return (bool) ($this->attributes['is_voted'] ?? false);
    }
}
