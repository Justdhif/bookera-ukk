<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

use App\Services\RecaptchaService;
use Illuminate\Validation\ValidationException;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:users,email',
            'recaptcha_token' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email harus diisi',
            'email.email' => 'Format email tidak valid',
            'email.exists' => 'Email tidak terdaftar',
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
