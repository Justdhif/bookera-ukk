<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherDetail extends Model
{
    protected $table = 'teacher_details';

    protected $fillable = [
        'user_id',
        'employee_number',
        'subject',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
