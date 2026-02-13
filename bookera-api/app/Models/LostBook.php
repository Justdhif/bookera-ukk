<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $loan_id
 * @property int $book_copy_id
 * @property \Illuminate\Support\Carbon $estimated_lost_date
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Loan $loan
 * @property-read \App\Models\BookCopy $bookCopy
 */
class LostBook extends Model
{
    protected $fillable = [
        'loan_id',
        'book_copy_id',
        'estimated_lost_date',
        'notes',
    ];

    protected $casts = [
        'estimated_lost_date' => 'date',
    ];

    /**
     * Get the loan associated with this lost book
     */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * Get the book copy that was lost
     */
    public function bookCopy(): BelongsTo
    {
        return $this->belongsTo(BookCopy::class);
    }
}
