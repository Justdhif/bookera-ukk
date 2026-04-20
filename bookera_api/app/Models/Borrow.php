<?php

namespace App\Models;

use App\Models\BorrowRequest;
use App\Models\BookReturn;
use App\Models\BorrowDetail;
use App\Models\FineBorrow;
use App\Models\LostBook;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Borrow extends Model
{
    use HasFactory;

    protected $table = 'borrows';

    protected $fillable = [
        'user_id',
        'borrow_request_id',
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

    public function borrowRequest()
    {
        return $this->belongsTo(BorrowRequest::class);
    }

    public function borrowDetails()
    {
        return $this->hasMany(BorrowDetail::class)->orderBy('id');
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
        return $this->hasMany(FineBorrow::class, 'borrow_id')->orderBy('id');
    }

    public function lostBook()
    {
        return $this->lostBooks();
    }

    public function lostBooks()
    {
        return $this->hasMany(LostBook::class)->orderBy('id');
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
