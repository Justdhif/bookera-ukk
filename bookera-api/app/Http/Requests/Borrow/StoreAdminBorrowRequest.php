<?php

namespace App\Http\Requests\Borrow;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminBorrowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'         => 'required|integer|exists:users,id',
            'book_copy_ids'   => 'required|array|min:1',
            'book_copy_ids.*' => 'required|integer|exists:book_copies,id',
            'borrow_date'     => 'required|date|after_or_equal:today',
            'return_date'     => 'required|date|after:borrow_date',
        ];
    }
}
