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
            'content'   => ['required_without:image', 'string', new \App\Rules\ModeratedContent()],
            'parent_id' => ['nullable', 'exists:complaint_comments,id'],
            'image'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }
}
