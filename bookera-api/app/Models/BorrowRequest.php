<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowRequest extends Model
{
    protected $table = 'borrow_requests';

    protected $fillable = [
        'user_id',
        'borrow_date',
        'return_date',
        'approval_status',
        'reject_reason',
    ];

    protected $casts = [
        'borrow_date'     => 'date',
        'return_date'     => 'date',
        'approval_status' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function borrowRequestDetails()
    {
        return $this->hasMany(BorrowRequestDetail::class);
    }

    public function details()
    {
        return $this->borrowRequestDetails();
    }
}
