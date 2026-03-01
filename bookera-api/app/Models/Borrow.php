<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Borrow extends Model
{
    protected $table = 'borrows';

    protected $fillable = [
        'user_id',
        'borrow_code',
        'qr_code_path',
        'borrow_date',
        'return_date',
        'status',
    ];

    protected $appends = ['qr_code_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function borrowDetails()
    {
        return $this->hasMany(BorrowDetail::class);
    }

    public function details()
    {
        return $this->borrowDetails();
    }

    public function bookReturns()
    {
        return $this->hasMany(BookReturn::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }

    public function lostBook()
    {
        return $this->hasOne(LostBook::class);
    }

    public function lostBooks()
    {
        return $this->hasMany(LostBook::class);
    }

    public function getQrCodeUrlAttribute(): ?string
    {
        if (! $this->qr_code_path) {
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

}
