<?php

namespace App\Http\Requests\BookCopy;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookCopyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'copy_code' => 'required|string|unique:book_copies,copy_code',
            'status' => 'nullable|string|default:available',
        ];
    }
}
