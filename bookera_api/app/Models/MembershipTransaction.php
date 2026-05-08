<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'order_id',
        'plan',
        'amount',
        'status',
        'payment_type',
        'snap_token',
        'midtrans_payload',
        'va_number',
        'bank',
        'payment_payload',
        'paid_at',
        'expires_at',
    ];

    protected $casts = [
        'midtrans_payload' => 'array',
        'payment_payload'  => 'array',
        'paid_at'          => 'datetime',
        'expires_at'       => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
