<?php

namespace App\Http\Requests\Genre;

use Illuminate\Foundation\Http\FormRequest;

class StoreGenreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:genres,name',
            'description' => 'nullable|string',
        ];
    }
}
