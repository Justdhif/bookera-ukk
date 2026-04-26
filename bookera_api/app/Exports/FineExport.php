<?php

namespace App\Exports;

use App\Models\FineBorrow;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class FineExport implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(private Collection $fines)
    {
    }

    public function collection(): Collection
    {
        return $this->fines->map(function (FineBorrow $fine) {
            return [
                'borrow_code' => $fine->borrow?->borrow_code ?? '-',
                'borrower' => $fine->borrow?->user?->profile?->full_name ?? $fine->borrow?->user?->email ?? '-',
                'fine_type' => $fine->fineType?->name ?? '-',
                'amount' => (float) $fine->amount,
                'status' => ucfirst($fine->status ?? '-'),
                'created_at' => optional($fine->created_at)->format('Y-m-d H:i:s'),
                'paid_at' => optional($fine->paid_at)->format('Y-m-d H:i:s'),
                'notes' => $fine->notes ?? '-',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Borrow Code',
            'Borrower',
            'Fine Type',
            'Amount',
            'Status',
            'Created At',
            'Paid At',
            'Notes',
        ];
    }

    public function title(): string
    {
        return 'Fines Data Export';
    }
}