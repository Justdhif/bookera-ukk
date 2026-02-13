<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $book_id
 * @property string $copy_code
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Book $book
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoanDetail> $loanDetails
 * @property-read int|null $loan_details_count
 */
class BookCopy extends Model
{
    protected $table = 'book_copies';

    protected $fillable = [
        'book_id',
        'copy_code',
        'status',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function loanDetails()
    {
        return $this->hasMany(LoanDetail::class);
    }
}
