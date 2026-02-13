<?php

namespace App\Services\Auth;

use App\Helpers\ActivityLogger;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new \Exception('Email atau password salah');
        }

        if (!$user->is_active) {
            throw new \Exception('Akun tidak aktif', 403);
        }

        Auth::login($user);

        $token = $user->createToken('api-token')->plainTextToken;

        $user->update(['last_login_at' => now()]);
        $user->load('profile');

        return [
            'token' => $token,
            'user' => $user
        ];
    }

    public function logout(User $user): void
    {
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
    }

    public function getCurrentUser(User $user): User
    {
        return $user->load('profile');
    }
}
