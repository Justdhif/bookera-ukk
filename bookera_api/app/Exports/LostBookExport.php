<?php

namespace App\Exports;

use App\Models\LostBook;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class LostBookExport implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(private Collection $lostBooks)
    {
    }

    public function collection(): Collection
    {
        return $this->lostBooks->flatMap(function (LostBook $lostBook) {
            $borrower = $lostBook->borrow?->user?->profile?->full_name ?? $lostBook->borrow?->user?->email ?? '-';

            return $lostBook->details->map(function ($detail) use ($lostBook, $borrower) {
                $book = $detail->bookCopy?->book;

                return [
                    'borrow_code' => $lostBook->borrow?->borrow_code ?? '-',
                    'borrower' => $borrower,
                    'lost_date' => $detail->lost_date ? Carbon::parse($detail->lost_date)->format('Y-m-d') : '-',
                    'book_title' => $book?->title ?? '-',
                    'copy_code' => $detail->bookCopy?->copy_code ?? '-',
                    'notes' => $detail->notes ?? $lostBook->notes ?? '-',
                    'created_at' => optional($lostBook->created_at)->format('Y-m-d H:i:s'),
                ];
            });
        })->values();
    }

    public function headings(): array
    {
        return [
            'Borrow Code',
            'Borrower',
            'Lost Date',
            'Book Title',
            'Copy Code',
            'Notes',
            'Created At',
        ];
    }

    public function title(): string
    {
        return 'Lost Books Data Export';
    }
}