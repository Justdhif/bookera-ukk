<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

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

    public function register(array $userData, array $profileData): array
    {
        try {
            DB::beginTransaction();

            $user = User::create([
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'role' => $userData['role'] ?? 'user',
                'is_active' => true,
            ]);

            $profile = new UserProfile([
                'user_id' => $user->id,
                'full_name' => $profileData['full_name'],
                'gender' => $profileData['gender'] ?? null,
                'birth_date' => $profileData['birth_date'] ?? null,
                'phone_number' => $profileData['phone_number'] ?? null,
                'address' => $profileData['address'] ?? null,
                'bio' => $profileData['bio'] ?? null,
                'identification_number' => $profileData['identification_number'] ?? null,
                'occupation' => $profileData['occupation'] ?? null,
                'institution' => $profileData['institution'] ?? null,
            ]);

            $user->profile()->save($profile);

            DB::commit();

            Auth::login($user);

            $token = $user->createToken('api-token')->plainTextToken;
            $user->load('profile');

            return [
                'token' => $token,
                'user' => $user
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Gagal melakukan registrasi: ' . $e->getMessage());
        }
    }

    public function setupProfile(User $user, array $profileData, $avatarFile = null): User
    {
        try {
            DB::beginTransaction();

            // Handle avatar upload if provided
            if ($avatarFile) {
                $avatarPath = $avatarFile->store('avatars', 'public');

                // if ($user->profile && $user->profile->avatar) {
                
                // }

                $profileData['avatar'] = $avatarPath;
            }

            if ($user->profile) {
                $user->profile->update($profileData);
            } else {
                $profileData['user_id'] = $user->id;
                UserProfile::create($profileData);
            }

            DB::commit();

            return $user->load('profile');

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Gagal mengupdate profile: ' . $e->getMessage());
        }
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
