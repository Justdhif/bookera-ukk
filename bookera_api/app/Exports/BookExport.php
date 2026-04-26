<?php

namespace App\Exports;

use App\Models\Book;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;

class BookExport implements FromCollection, WithHeadings, WithTitle, WithMapping
{
    public function __construct(private Collection $books)
    {
    }

    public function collection(): Collection
    {
        return $this->books;
    }

    public function map($book): array
    {
        return [
            $book->title,
            $book->isbn ?? '-',
            $book->authors->pluck('name')->implode(', ') ?: '-',
            $book->publishers->pluck('name')->implode(', ') ?: '-',
            $book->categories->pluck('name')->implode(', ') ?: '-',
            $book->genres->pluck('name')->implode(', ') ?: '-',
            $book->publication_year ?? '-',
            $book->language ?? '-',
            (int) $book->total_copies_count,
            (int) $book->available_copies_count,
            (float) $book->price,
            $book->is_active ? 'Active' : 'Inactive',
            $book->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'Title',
            'ISBN',
            'Authors',
            'Publishers',
            'Categories',
            'Genres',
            'Publication Year',
            'Language',
            'Total Copies',
            'Available Copies',
            'Price',
            'Status',
            'Created At',
        ];
    }

    public function title(): string
    {
        return 'Books Data Export';
    }
}
