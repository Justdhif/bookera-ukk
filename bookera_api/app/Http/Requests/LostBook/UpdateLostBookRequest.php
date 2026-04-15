<?php

namespace App\Http\Requests\LostBook;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLostBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('lost_date') && $this->filled('estimated_lost_date')) {
            $this->merge([
                'lost_date' => $this->input('estimated_lost_date'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'lost_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];
    }
}
