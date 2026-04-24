<?php

namespace App\Imports;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Author;
use App\Models\Publisher;
use App\Services\Book\BookService;
use App\Helpers\SlugGenerator;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BookImport implements ToCollection, WithHeadingRow, SkipsEmptyRows
{
    private BookService $bookService;

    public function __construct()
    {
        $this->bookService = app(BookService::class);
    }

    public function collection(Collection $rows)
    {
        Log::info('BookImport@collection called with ' . $rows->count() . ' rows.');
        foreach ($rows as $index => $row) {
            // Log row for debugging
            if ($index === 0) {
                Log::info('Import row 1 keys: ' . json_encode(array_keys($row->toArray())));
                Log::info('Import row 1 data: ' . json_encode($row->toArray()));
            }

            if (empty($row['title'])) {
                continue;
            }

            DB::transaction(function () use ($row) {
                // Resolve Categories
                $categoryIds = $this->resolveRelationIds(
                    Category::class,
                    'categories',
                    $row['categories'] ?? ''
                );

                // Resolve Authors
                $authorIds = $this->resolveRelationIds(
                    Author::class,
                    'authors',
                    $row['authors'] ?? ''
                );

                // Resolve Publishers
                $publisherIds = $this->resolveRelationIds(
                    Publisher::class,
                    'publishers',
                    $row['publishers'] ?? ''
                );

                // Prepare book data
                $bookData = [
                    'title' => $row['title'],
                    'isbn' => $row['isbn'] ?? null,
                    'description' => $row['description'] ?? null,
                    'publication_year' => $row['publication_year'] ?? null,
                    'language' => $row['language'] ?? 'Indonesia',
                    'price' => $row['price'] ?? 0,
                    'is_active' => true,
                    'category_ids' => $categoryIds,
                    'author_ids' => $authorIds,
                    'publisher_ids' => $publisherIds,
                ];

                // Create book using service
                $book = $this->bookService->create($bookData);

                // Handle copies from Copy Codes column
                $copyCodesString = $row['copy_codes'] ?? '';
                
                if (!empty($copyCodesString)) {
                    $copyCodes = array_map('trim', explode(',', $copyCodesString));
                    
                    foreach ($copyCodes as $copyCode) {
                        if (empty($copyCode)) continue;

                        if (BookCopy::where('copy_code', $copyCode)->exists()) {
                            $copyCode = $copyCode . '-' . strtoupper(Str::random(4));
                        }

                        BookCopy::create([
                            'book_id' => $book->id,
                            'copy_code' => $copyCode,
                            'status' => 'available'
                        ]);
                    }
                }
            });
        }
    }

    private function resolveRelationIds(string $modelClass, string $tableName, string $namesString): array
    {
        if (empty($namesString)) {
            return [];
        }

        $names = array_map('trim', explode(',', $namesString));
        $ids = [];

        foreach ($names as $name) {
            if (empty($name)) continue;

            $model = $modelClass::where('name', $name)->first();

            if (!$model) {
                $slug = SlugGenerator::generate($tableName, 'slug', $name);
                $data = [
                    'name' => $name,
                    'slug' => $slug,
                ];

                if ($modelClass === Author::class || $modelClass === Publisher::class) {
                    $data['is_active'] = true;
                    $data['photo'] = 'placeholder.jpg';
                }

                $model = $modelClass::create($data);
            }

            $ids[] = $model->id;
        }

        return $ids;
    }
}
