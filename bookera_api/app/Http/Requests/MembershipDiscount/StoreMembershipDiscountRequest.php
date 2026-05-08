<?php

namespace App\Http\Requests\MembershipDiscount;

use Illuminate\Foundation\Http\FormRequest;

class StoreMembershipDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'discount_key'        => 'required|string|unique:membership_discounts,discount_key',
            'name'                => 'required|string|max:255',
            'discount_percentage' => 'required|integer|min:0|max:100',
            'description'         => 'nullable|string',
        ];
    }
}
