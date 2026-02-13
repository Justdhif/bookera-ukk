<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $loan_date
 * @property \Illuminate\Support\Carbon $due_date
 * @property string $status
 * @property string $approval_status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoanDetail> $loanDetails
 * @property-read int|null $loan_details_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoanDetail> $details
 * @property-read int|null $details_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BookReturn> $bookReturns
 * @property-read int|null $book_returns_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fine> $fines
 * @property-read int|null $fines_count
 * @property-read \App\Models\LostBook|null $lostBook
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LostBook> $lostBooks
 * @property-read int|null $lost_books_count
 */
class Loan extends Model
{
    protected $table = 'loans';

    protected $fillable = [
        'user_id',
        'loan_date',
        'due_date',
        'status',
        'approval_status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loanDetails()
    {
        return $this->hasMany(LoanDetail::class);
    }

    public function details()
    {
        return $this->loanDetails();
    }

    public function bookReturns()
    {
        return $this->hasMany(BookReturn::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }

    public function lostBook()
    {
        return $this->hasOne(LostBook::class);
    }

    public function lostBooks()
    {
        return $this->hasMany(LostBook::class);
    }
}
