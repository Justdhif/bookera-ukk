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
    ];

    public function loanDetails()
    {
        return $this->hasMany(LoanDetail::class);
    }
}
