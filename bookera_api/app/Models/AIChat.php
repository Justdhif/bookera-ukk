<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIChat extends Model
{
    protected $table = 'ai_chats';
    
    protected $fillable = [
        'user_id',
        'message',
        'response'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
