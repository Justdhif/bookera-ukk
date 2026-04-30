<?php

namespace App\Http\Requests\Discussion;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiscussionCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'   => ['required_without:image', 'string', 'max:1000', new \App\Rules\ModeratedContent()],
            'parent_id' => 'nullable|integer|exists:discussion_comments,id',
            'image'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }
}
