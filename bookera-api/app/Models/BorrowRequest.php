<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BorrowRequest extends Model
{
    protected $table = 'borrow_requests';

    protected $fillable = [
        'user_id',
        'request_code',
        'qr_code_path',
        'borrow_date',
        'return_date',
    ];

    protected $appends = ['qr_code_url'];

    public function getQrCodeUrlAttribute(): ?string
    {
        if (!$this->qr_code_path) {
            return null;
        }

        $absolutePath = storage_path('app/public/' . $this->qr_code_path);

        if (!file_exists($absolutePath)) {
            return null;
        }

        $content = file_get_contents($absolutePath);
        $extension = strtolower(pathinfo($this->qr_code_path, PATHINFO_EXTENSION));
        $mimeType = $extension === 'svg' ? 'image/svg+xml' : 'image/' . $extension;

        return 'data:' . $mimeType . ';base64,' . base64_encode($content);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function borrowRequestDetails()
    {
        return $this->hasMany(BorrowRequestDetail::class);
    }

    public function details()
    {
        return $this->borrowRequestDetails();
    }
}
