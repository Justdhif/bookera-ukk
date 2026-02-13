<?php

namespace App\Http\Requests\Loan;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'book_copy_ids' => 'array|min:1',
            'book_copy_ids.*' => 'integer|exists:book_copies,id',
            'due_date' => 'date|after_or_equal:today',
        ];
    }
}
