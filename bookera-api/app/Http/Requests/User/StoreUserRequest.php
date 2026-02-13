<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @property string $email
 * @property string $password
 * @property string $role
 * @property bool|string|null $is_active
 * @property string $full_name
 * @property string|null $gender
 * @property string|null $birth_date
 * @property string|null $phone_number
 * @property string|null $address
 * @property string|null $bio
 * @property string|null $identification_number
 * @property string|null $occupation
 * @property string|null $institution
 * @property mixed $avatar
 */
class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => ['required', Rule::in(['admin', 'officer', 'user'])],
            'is_active' => 'nullable|in:true,false,1,0',
            'full_name' => 'required|string|max:255',
            'gender' => ['nullable', Rule::in(['male', 'female', 'prefer_not_to_say'])],
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'bio' => 'nullable|string',
            'identification_number' => 'nullable|string|unique:user_profiles,identification_number',
            'occupation' => 'nullable|string|max:100',
            'institution' => 'nullable|string|max:255',
            'avatar' => 'nullable',
        ];
    }
}
