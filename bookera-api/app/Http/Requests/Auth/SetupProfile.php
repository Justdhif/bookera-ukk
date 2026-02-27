<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SetupProfile extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'gender' => 'nullable|in:male,female,prefer_not_to_say',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
            'identification_number' => 'nullable|string|max:50',
            'occupation' => 'nullable|string|max:100',
            'institution' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap harus diisi',
            'full_name.max' => 'Nama lengkap maksimal 255 karakter',
            'gender.in' => 'Gender harus salah satu dari: male, female, prefer_not_to_say',
            'birth_date.date' => 'Format tanggal lahir tidak valid',
            'phone_number.max' => 'Nomor telepon maksimal 20 karakter',
            'address.max' => 'Alamat maksimal 500 karakter',
            'bio.max' => 'Bio maksimal 1000 karakter',
            'identification_number.max' => 'Nomor identifikasi maksimal 50 karakter',
            'occupation.max' => 'Pekerjaan/jabatan maksimal 100 karakter',
            'institution.max' => 'Institusi maksimal 255 karakter',
            'avatar.image' => 'Avatar harus berupa gambar',
            'avatar.mimes' => 'Avatar harus berformat jpeg, png, atau jpg',
            'avatar.max' => 'Ukuran avatar maksimal 2MB',
        ];
    }
}
