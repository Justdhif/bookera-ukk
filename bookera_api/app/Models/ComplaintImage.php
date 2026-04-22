<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintImage extends Model
{
    use HasFactory;

    protected $table = 'complaint_images';

    protected $fillable = [
        'complaint_id',
        'image_path',
        'order',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }
}
