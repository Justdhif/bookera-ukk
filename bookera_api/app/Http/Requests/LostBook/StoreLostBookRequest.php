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
            'borrow_detail_ids' => 'required|array|min:1',
            'borrow_detail_ids.*' => 'required|integer|distinct|exists:borrow_details,id',
        ];
    }
}
