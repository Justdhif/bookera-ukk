<?php

namespace App\Http\Requests\News;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Any authenticated user can comment
    }

    public function rules(): array
    {
        return [
            'content'   => 'nullable|required_without:image|string',
            'image'     => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'parent_id' => 'nullable|exists:news_comments,id',
        ];
    }
}
