<?php

namespace App\Exports;

use App\Models\BorrowRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class BorrowRequestExport implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(private Collection $requests)
    {
    }

    public function collection(): Collection
    {
        return $this->requests->map(function (BorrowRequest $request) {
            $books = $request->borrowRequestDetails
                ->groupBy('book_id')
                ->map(function ($details) {
                    $firstDetail = $details->first();
                    $book = $firstDetail->book;

                    if (! $book) {
                        return null;
                    }

                    return $book->title . ' (' . $details->count() . ')';
                })
                ->filter()
                ->implode(', ');

            return [
                'borrower' => $request->user?->profile?->full_name ?? $request->user?->email ?? '-',
                'borrow_date' => $request->borrow_date ? Carbon::parse($request->borrow_date)->format('Y-m-d') : '-',
                'return_date' => $request->return_date ? Carbon::parse($request->return_date)->format('Y-m-d') : '-',
                'approval_status' => ucfirst($request->approval_status ?? '-'),
                'books' => $books,
                'created_at' => optional($request->created_at)->format('Y-m-d H:i:s'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Borrower',
            'Borrow Date',
            'Return Date',
            'Status',
            'Books Requested',
            'Created At',
        ];
    }

    public function title(): string
    {
        return 'Borrow Requests Data Export';
    }
}
