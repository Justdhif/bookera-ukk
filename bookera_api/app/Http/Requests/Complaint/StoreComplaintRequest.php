<?php

namespace App\Http\Requests\Complaint;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255', new \App\Rules\ModeratedContent()],
            'description' => ['required', 'string', new \App\Rules\ModeratedContent()],
            'category'    => ['required', 'in:website,facility,service,other'],
            'images'      => ['nullable', 'array', 'max:5'],
            'images.*'    => ['image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }
}
