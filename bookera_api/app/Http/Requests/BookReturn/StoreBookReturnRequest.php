<?php

namespace App\Http\Requests\BookReturn;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.borrow_detail_id' => 'required|integer|exists:borrow_details,id',
            'items.*.status' => 'required|string|in:returned,lost',
            'items.*.condition' => 'nullable|string|in:good,damaged',
            'items.*.fine_type_id' => 'nullable|integer|exists:fine_types,id',
            'items.*.lost_date' => 'nullable|date',
            'items.*.notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
