<?php

namespace App\Exports;

use App\Models\Borrow;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class BorrowExport implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(private Collection $borrows)
    {
    }

    public function collection(): Collection
    {
        return $this->borrows->map(function (Borrow $borrow) {
            $books = $borrow->borrowDetails
                ->map(function ($detail) {
                    $book = $detail->bookCopy?->book;

                    if (! $book) {
                        return null;
                    }

                    return $book->title . ' (' . ($detail->bookCopy?->copy_code ?? '-') . ')';
                })
                ->filter()
                ->implode(', ');

            return [
                'borrow_code' => $borrow->borrow_code,
                'borrower' => $borrow->user?->profile?->full_name ?? $borrow->user?->email ?? '-',
                'borrow_date' => $borrow->borrow_date ? Carbon::parse($borrow->borrow_date)->format('Y-m-d') : '-',
                'return_date' => $borrow->return_date ? Carbon::parse($borrow->return_date)->format('Y-m-d') : '-',
                'status' => ucfirst($borrow->status ?? '-'),
                'books' => $books,
                'total_fine' => (float) $borrow->fines->sum('amount'),
                'outstanding_fine' => (float) $borrow->fines->where('status', 'unpaid')->sum('amount'),
                'created_at' => optional($borrow->created_at)->format('Y-m-d H:i:s'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Borrow Code',
            'Borrower',
            'Borrow Date',
            'Return Date',
            'Status',
            'Books',
            'Total Fine',
            'Outstanding Fine',
            'Created At',
        ];
    }

    public function title(): string
    {
        return 'Borrows Data Export';
    }
}