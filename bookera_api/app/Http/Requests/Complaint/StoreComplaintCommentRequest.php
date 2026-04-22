<?php

namespace App\Http\Requests\Complaint;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'   => ['required', 'string'],
            'parent_id' => ['nullable', 'exists:complaint_comments,id'],
        ];
    }
}
