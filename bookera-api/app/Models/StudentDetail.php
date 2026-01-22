<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentDetail extends Model
{
    protected $table = 'student_details';

    protected $fillable = [
        'user_id',
        'student_number',
        'grade_level',
        'major',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
