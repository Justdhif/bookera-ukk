<?php

namespace App\Http\Requests\BookReturn;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'copies' => 'required|array',
            'copies.*.book_copy_id' => 'required|integer|exists:book_copies,id',
            'copies.*.condition' => 'required|string|in:good,damaged',
        ];
    }
}
