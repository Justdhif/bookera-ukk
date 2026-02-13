<?php

namespace App\Http\Requests\LostBook;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLostBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estimated_lost_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];
    }
}
