<?php

namespace App\Http\Requests\FineType;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFineTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:lost,damaged,late',
            'amount' => 'sometimes|required_unless:type,damaged|numeric|min:0',
            'percentage' => 'sometimes|required_if:type,damaged|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ];
    }
}
