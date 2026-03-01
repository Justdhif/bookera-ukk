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
            'borrow_detail_ids'   => 'required|array|min:1',
            'borrow_detail_ids.*' => 'required|integer|exists:borrow_details,id',
        ];
    }
}
