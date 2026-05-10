<?php

namespace App\Http\Requests\DiscountKey;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiscountKeyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key'         => 'required|string|unique:discount_keys,key',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ];
    }
}
