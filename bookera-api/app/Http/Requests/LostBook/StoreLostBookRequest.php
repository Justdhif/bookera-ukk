<?php

namespace App\Http\Requests\LostBook;

use Illuminate\Foundation\Http\FormRequest;

class StoreLostBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'book_copy_id' => 'required|integer|exists:book_copies,id',
            'estimated_lost_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];
    }
}
