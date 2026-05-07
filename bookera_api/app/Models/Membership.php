<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Membership extends Model
{
    protected $fillable = [
        'user_id',
        'membership_plan_id',
        'member_code',
        'qr_code_path',
        'qr_code', // keep for legacy if needed, but we'll use path
        'joined_at',
        'expires_at',
        'status',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = ['qr_code_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }

    public function getQrCodeUrlAttribute(): ?string
    {
        if (! $this->qr_code_path) {
            return null;
        }

        $absolutePath = storage_path('app/public/'.$this->qr_code_path);

        if (! file_exists($absolutePath)) {
            return null;
        }

        $content = file_get_contents($absolutePath);
        $extension = strtolower(pathinfo($this->qr_code_path, PATHINFO_EXTENSION));
        $mimeType = $extension === 'svg' ? 'image/svg+xml' : 'image/'.$extension;

        return 'data:'.$mimeType.';base64,'.base64_encode($content);
    }
}
