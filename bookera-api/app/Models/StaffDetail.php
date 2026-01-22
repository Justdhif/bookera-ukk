<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffDetail extends Model
{
    protected $table = 'staff_details';

    protected $fillable = [
        'user_id',
        'staff_number',
        'position',
        'department',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
