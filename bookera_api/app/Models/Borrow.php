<?php

namespace App\Models;

use App\Models\BorrowRequest;
use App\Models\BookReturn;
use App\Models\BorrowDetail;
use App\Models\BorrowRequestDetail;
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

    protected $appends = ['qr_code_url', 'estimated_late_fine', 'grouped_details'];

    public function getGroupedDetailsAttribute()
    {
        $details = $this->borrowDetails->count() > 0 
            ? $this->borrowDetails 
            : ($this->borrowRequest ? $this->borrowRequest->borrowRequestDetails : collect());

        if ($details->isEmpty()) {
            return [];
        }

        $grouped = [];
        foreach ($details as $item) {
            $book = null;
            
            if ($item instanceof BorrowDetail && $item->bookCopy) {
                $book = $item->bookCopy->book;
            } elseif ($item instanceof BorrowRequestDetail) {
                $book = $item->book;
            }

            if (!$book) continue;

            $bookId = $book->id;
            if (isset($grouped[$bookId])) {
                $grouped[$bookId]['quantity']++;
            } else {
                $grouped[$bookId] = [
                    'id' => $item->id,
                    'book' => $book,
                    'quantity' => 1
                ];
            }
        }

        return array_values($grouped);
    }


    public function getEstimatedLateFineAttribute(): array
    {
        if ($this->status === 'close') {
            return [
                'is_late' => false,
                'days_late' => 0,
                'total_fine' => 0,
                'fine_per_book' => 0,
                'total_books' => 0
            ];
        }

        $expectedReturnDate = \Illuminate\Support\Carbon::parse($this->return_date)->startOfDay();
        $today = now()->startOfDay();

        if (!$today->greaterThan($expectedReturnDate)) {
            return [
                'is_late' => false,
                'days_late' => 0,
                'total_fine' => 0,
                'fine_per_book' => 0,
                'total_books' => 0
            ];
        }

        $daysLate = (int) $expectedReturnDate->diffInDays($today);
        $lateFineType = FineType::where('type', 'late')->orderBy('amount')->first();
        
        if (!$lateFineType) {
            return [
                'is_late' => true,
                'days_late' => $daysLate,
                'total_fine' => 0,
                'fine_per_book' => 0,
                'total_books' => 0
            ];
        }

        // Count books that haven't been returned or marked lost yet
        $unprocessedBooksCount = $this->borrowDetails()
            ->where('status', 'borrowed')
            ->count();

        $totalFine = $lateFineType->amount * $daysLate * $unprocessedBooksCount;

        return [
            'is_late' => true,
            'days_late' => $daysLate,
            'total_fine' => (float) $totalFine,
            'fine_per_book' => (float) $lateFineType->amount,
            'total_books' => $unprocessedBooksCount,
            'fine_name' => $lateFineType->name,
            'fine_description' => $lateFineType->description
        ];
    }

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
        return $this->hasMany(BookReturn::class)
            ->whereNotNull('book_copy_id')
            ->orderBy('id');
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
        return $this->hasMany(LostBook::class)
            ->whereNotNull('book_copy_id')
            ->orderBy('id');
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
