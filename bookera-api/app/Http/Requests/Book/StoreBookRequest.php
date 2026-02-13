<?php

namespace App\Http\Requests\Book;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'author' => 'required|string',
            'publisher' => 'nullable|string',
            'publication_year' => 'nullable|integer',
            'isbn' => 'nullable|string|unique:books,isbn',
            'description' => 'nullable|string',
            'language' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ];
    }
}
