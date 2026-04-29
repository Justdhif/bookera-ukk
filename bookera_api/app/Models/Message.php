<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        'image_path',
        'is_read',
        'is_ai'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_ai' => 'boolean',
        'image_path' => 'array',
    ];

    public function getImagePathAttribute($value)
    {
        if ($value) {
            $paths = is_array($value) ? $value : json_decode($value, true);
            if (is_array($paths)) {
                return array_map(function ($path) {
                    return storage_image($path);
                }, $paths);
            }
            return storage_image($value);
        }
        return null;
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
