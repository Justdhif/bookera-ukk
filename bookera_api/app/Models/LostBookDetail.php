<?php

namespace App\Models;

use App\Models\BookCopy;
use App\Models\LostBook;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LostBookDetail extends Model
{
    use HasFactory;

    protected $table = 'lost_book_details';

    protected $fillable = [
        'lost_book_id',
        'book_copy_id',
        'lost_date',
        'notes',
    ];

    protected $casts = [
        'lost_date' => 'date',
    ];

    public function lostBook(): BelongsTo
    {
        return $this->belongsTo(LostBook::class);
    }

    public function bookCopy(): BelongsTo
    {
        return $this->belongsTo(BookCopy::class);
    }
}
