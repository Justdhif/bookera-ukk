<?php

namespace App\Http\Requests\News;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title'   => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ];
    }
}
