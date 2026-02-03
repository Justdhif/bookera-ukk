<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
