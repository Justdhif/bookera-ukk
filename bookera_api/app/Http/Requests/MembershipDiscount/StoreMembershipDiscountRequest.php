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
            'discount_key_id'     => 'required|exists:discount_keys,id|unique:membership_discounts,discount_key_id',
            'discount_percentage' => 'required|integer|min:0|max:100',
        ];
    }
}
