<?php

namespace App\Exports;

use App\Models\Borrow;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class BookReturnExport implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(private Collection $borrows)
    {
    }

    public function collection(): Collection
    {
        return $this->borrows->flatMap(function (Borrow $borrow) {
            $borrower = $borrow->user?->profile?->full_name ?? $borrow->user?->email ?? '-';
            $fineTotal = (float) $borrow->fines->sum('amount');
            $outstandingFine = (float) $borrow->fines->where('status', 'unpaid')->sum('amount');

            return $borrow->bookReturns->flatMap(function ($bookReturn) use ($borrow, $borrower, $fineTotal, $outstandingFine) {
                return $bookReturn->details->map(function ($detail) use ($borrow, $borrower, $bookReturn, $fineTotal, $outstandingFine) {
                    $book = $detail->bookCopy?->book;

                    return [
                        'borrow_code' => $borrow->borrow_code,
                        'borrower' => $borrower,
                        'borrow_date' => $borrow->borrow_date ? Carbon::parse($borrow->borrow_date)->format('Y-m-d') : '-',
                        'return_date' => $bookReturn->return_date ? Carbon::parse($bookReturn->return_date)->format('Y-m-d') : '-',
                        'book_title' => $book?->title ?? '-',
                        'copy_code' => $detail->bookCopy?->copy_code ?? '-',
                        'condition' => ucfirst($detail->condition ?? '-'),
                        'total_fine' => $fineTotal,
                        'outstanding_fine' => $outstandingFine,
                        'created_at' => optional($bookReturn->created_at)->format('Y-m-d H:i:s'),
                    ];
                });
            });
        })->values();
    }

    public function headings(): array
    {
        return [
            'Borrow Code',
            'Borrower',
            'Borrow Date',
            'Return Date',
            'Book Title',
            'Copy Code',
            'Condition',
            'Total Fine',
            'Outstanding Fine',
            'Created At',
        ];
    }

    public function title(): string
    {
        return 'Returns Data Export';
    }
}