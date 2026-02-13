<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $loan_id
 * @property \Illuminate\Support\Carbon $return_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Loan $loan
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BookReturnDetail> $bookReturnDetails
 * @property-read int|null $book_return_details_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BookReturnDetail> $details
 * @property-read int|null $details_count
 */
class BookReturn extends Model
{
    protected $table = 'book_returns';

    protected $fillable = [
        'loan_id',
        'return_date',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function bookReturnDetails()
    {
        return $this->hasMany(BookReturnDetail::class);
    }

    public function details()
    {
        return $this->bookReturnDetails();
    }
}
