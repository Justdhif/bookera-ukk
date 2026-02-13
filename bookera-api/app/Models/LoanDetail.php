<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $loan_id
 * @property int $book_copy_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Loan $loan
 * @property-read \App\Models\BookCopy $bookCopy
 */
class LoanDetail extends Model
{
    protected $table = 'loan_details';

    protected $fillable = [
        'loan_id',
        'book_copy_id',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }
}
