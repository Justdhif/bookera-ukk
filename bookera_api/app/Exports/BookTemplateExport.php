<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class BookTemplateExport implements FromArray, WithHeadings, WithTitle
{
    public function array(): array
    {
        return [
            [
                'Contoh Buku Laravel',
                '978-602-0000-00-0',
                'Panduan lengkap belajar Laravel dari nol sampai mahir.',
                '2024',
                'Indonesia',
                '150000',
                'Pemrograman, Teknologi',
                'Taylor Otwell, Jeffrey Way',
                'Laravel Press',
                'B-001, B-002, B-003'
            ]
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
            'Copy Codes'
        ];
    }

    public function title(): string
    {
        return 'Import Books Template';
    }
}
