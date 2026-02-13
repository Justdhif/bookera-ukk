<?php

namespace App\Http\Requests\Fine;

use Illuminate\Foundation\Http\FormRequest;

class StoreFineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fine_type_id' => 'required|integer|exists:fine_types,id',
            'amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ];
    }
}
