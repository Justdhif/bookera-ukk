<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Borrow;
use App\Models\BorrowRequestDetail;
use App\Models\User;

class BorrowRequest extends Model
{
    use HasFactory;

    protected $table = 'borrow_requests';

    protected $fillable = [
        'user_id',
        'borrow_date',
        'return_date',
        'approval_status',
        'reject_reason',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'return_date' => 'date',
        'approval_status' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function borrowRequestDetails()
    {
        return $this->hasMany(BorrowRequestDetail::class)->orderBy('id');
    }

    public function details()
    {
        return $this->borrowRequestDetails();
    }

    public function borrow()
    {
        return $this->hasOne(Borrow::class);
    }
}
