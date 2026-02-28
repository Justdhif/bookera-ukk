<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\UserProfile;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthService
{
    /**
     * Login user with email and password
     */
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

    /**
     * Register new user with email and password only
     * Profile will be set up separately via setupProfile
     */
    public function register(array $userData): array
    {
        try {
            DB::beginTransaction();

            $user = User::create([
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'role' => 'user',
                'is_active' => true,
            ]);

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

    /**
     * Setup or update user profile
     */
    public function setupProfile(User $user, array $profileData, $avatarFile = null): User
    {
        try {
            DB::beginTransaction();

            // Handle avatar: file upload takes priority, then avatar_url (default avatar)
            $avatarUrl = $profileData['avatar_url'] ?? null;
            unset($profileData['avatar_url']);

            if ($avatarFile) {
                $avatarPath = $avatarFile->store('avatars', 'public');

                // Delete old avatar file if it was a local upload
                if ($user->profile && $user->profile->getRawOriginal('avatar')) {
                    $oldAvatar = $user->profile->getRawOriginal('avatar');
                    if (!str_starts_with($oldAvatar, 'http')) {
                        $storagePath = storage_path('app/public/' . $oldAvatar);
                        if (file_exists($storagePath)) {
                            unlink($storagePath);
                        }
                    }
                }

                $profileData['avatar'] = $avatarPath;
            } elseif ($avatarUrl) {
                $profileData['avatar'] = $avatarUrl;
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


    /**
     * Send password reset token to user's email via SMTP
     */
    public function forgotPassword(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('Email tidak terdaftar');
        }

        // Generate 6-digit OTP token
        $token = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        // Store the hashed token
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Send the email with the plain token
        Mail::to($email)->send(new ResetPasswordMail($token, $email));
    }

    /**
     * Reset user's password using token
     */
    public function resetPassword(string $email, string $token, string $password): void
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record) {
            throw new \Exception('Token reset password tidak ditemukan');
        }

        // Check if token is expired (60 minutes)
        $createdAt = Carbon::parse($record->created_at);
        if (Carbon::now()->diffInMinutes($createdAt) > 60) {
            // Delete expired token
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            throw new \Exception('Token reset password sudah kadaluarsa');
        }

        // Verify the token
        if (!Hash::check($token, $record->token)) {
            throw new \Exception('Token reset password tidak valid');
        }

        // Update the user's password
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User tidak ditemukan');
        }

        $user->update([
            'password' => Hash::make($password),
        ]);

        // Delete the used token
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();
    }

    /**
     * Logout user by deleting current access token
     */
    public function logout(User $user): void
    {
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
    }

    /**
     * Get current authenticated user with profile
     */
    public function getCurrentUser(User $user): User
    {
        return $user->load('profile');
    }
}
