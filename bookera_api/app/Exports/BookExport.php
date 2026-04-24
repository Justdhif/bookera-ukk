<?php

namespace App\Exports;

use App\Models\Book;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class BookExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Book::with(['copies', 'categories', 'authors', 'publishers'])->latest()->get();
    }

    /**
     * @var Book $book
     */
    public function map($book): array
    {
        $copyCodes = $book->copies->pluck('copy_code')->implode(', ');
        $categories = $book->categories->pluck('name')->implode(', ');
        $authors = $book->authors->pluck('name')->implode(', ');
        $publishers = $book->publishers->pluck('name')->implode(', ');
        
        return [
            $book->title,
            $book->isbn,
            $book->description,
            $book->publication_year,
            $book->language,
            $book->price,
            $categories,
            $authors,
            $publishers,
            $copyCodes,
            $book->is_active ? 'Active' : 'Inactive',
            $book->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'Title',
            'ISBN',
            'Description',
            'Publication Year',
            'Language',
            'Price',
            'Categories',
            'Authors',
            'Publishers',
            'Copy Codes',
            'Status',
            'Created At',
        ];
    }

    public function title(): string
    {
        return 'Books Data Export';
    }
}
