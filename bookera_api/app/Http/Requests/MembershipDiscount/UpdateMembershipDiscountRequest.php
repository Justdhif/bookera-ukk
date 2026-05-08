<?php

namespace App\Http\Requests\MembershipDiscount;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                => 'required|string|max:255',
            'discount_percentage' => 'required|integer|min:0|max:100',
            'description'         => 'nullable|string',
        ];
    }
}
