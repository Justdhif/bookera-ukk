<?php

namespace App\Http\Requests\BorrowRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreBorrowRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:books,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'borrow_date' => ['required', 'date', 'after_or_equal:today'],
            'return_date' => ['sometimes', 'nullable', 'date', 'after:borrow_date'],
        ];
    }
}
