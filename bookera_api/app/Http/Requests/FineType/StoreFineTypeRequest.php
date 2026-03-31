<?php

namespace App\Http\Requests\FineType;

use Illuminate\Foundation\Http\FormRequest;

class StoreFineTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:lost,damaged,late',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ];
    }
}
