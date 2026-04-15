<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionPostImage extends Model
{
    use HasFactory;

    protected $table = 'discussion_post_images';

    protected $fillable = [
        'post_id',
        'image_path',
        'order',
    ];

    public function getImagePathAttribute($value)
    {
        return $value ? storage_image($value) : null;
    }

    public function setImagePathAttribute($value)
    {
        $this->attributes['image_path'] = $value;
    }

    public function post()
    {
        return $this->belongsTo(DiscussionPost::class, 'post_id');
    }
}
