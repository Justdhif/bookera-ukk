<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LostBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrow_id',
        'book_copy_id',
        'estimated_lost_date',
        'notes',
    ];

    protected $casts = [
        'estimated_lost_date' => 'date',
    ];

    public function borrow(): BelongsTo
    {
        return $this->belongsTo(Borrow::class);
    }

    public function bookCopy(): BelongsTo
    {
        return $this->belongsTo(BookCopy::class);
    }
}
