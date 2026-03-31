<?php

namespace App\Http\Requests\BorrowRequest;

use Illuminate\Foundation\Http\FormRequest;

use App\Services\RecaptchaService;
use Illuminate\Validation\ValidationException;

class StoreBorrowRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'book_ids' => ['required', 'array', 'min:1'],
            'book_ids.*' => ['required', 'integer', 'exists:books,id'],
            'borrow_date' => ['required', 'date', 'after_or_equal:today'],
            'return_date' => ['required', 'date', 'after:borrow_date'],
            'recaptcha_token' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'recaptcha_token.required' => 'reCAPTCHA token harus diisi',
        ];
    }

    /**
     * @throws ValidationException
     */
    protected function passedValidation(): void
    {
        $token = $this->input('recaptcha_token');

        if (!app(RecaptchaService::class)->verify($token)) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.',
            ]);
        }
    }
}
