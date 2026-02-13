<?php

namespace App\Http\Requests\Loan;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'book_copy_ids' => 'required|array|min:1',
            'book_copy_ids.*' => 'required|integer|exists:book_copies,id',
            'due_date' => 'required|date|after_or_equal:today',
        ];
    }
}
