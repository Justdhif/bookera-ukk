<?php

namespace App\Http\Requests\BookReturn;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookReturnConditionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'conditions' => 'required|array|min:1',
            'conditions.*' => 'required|string|in:good,damaged,lost',
        ];
    }

    public function messages(): array
    {
        return [
            'conditions.required' => 'Kondisi buku harus diisi.',
            'conditions.array' => 'Format kondisi buku tidak valid.',
            'conditions.*.in' => 'Kondisi harus salah satu dari: good, damaged, lost.',
        ];
    }
}
