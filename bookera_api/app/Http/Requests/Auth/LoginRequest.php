<?php

namespace App\Http\Requests\Auth;

use App\Services\RecaptchaService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

/**
 * @property string $email
 * @property string $password
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'           => 'required|email',
            'password'        => 'required',
            'recaptcha_token' => 'nullable|string',
        ];
    }

    /**
     * Verify reCAPTCHA token after standard validation passes.
     *
     * @throws ValidationException
     */
    protected function passedValidation(): void
    {
        $token = $this->input('recaptcha_token');

        if ($token && !app(RecaptchaService::class)->verify($token)) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.',
            ]);
        }
    }
}
