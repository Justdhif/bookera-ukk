<?php

namespace App\Http\Requests\Save;

use Illuminate\Foundation\Http\FormRequest;

class AddBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'book_id' => 'required|exists:books,id',
        ];
    }
}
