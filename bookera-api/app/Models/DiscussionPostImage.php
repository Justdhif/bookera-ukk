<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $post_id
 * @property string $image_path
 * @property int $order
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\DiscussionPost $post
 */
class DiscussionPostImage extends Model
{
    protected $table = 'discussion_post_images';

    protected $fillable = [
        'post_id',
        'image_path',
        'order',
    ];

    protected function imagePath(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? storage_image($value) : null,
            set: fn ($value) => $value,
        );
    }

    public function post()
    {
        return $this->belongsTo(DiscussionPost::class, 'post_id');
    }
}
