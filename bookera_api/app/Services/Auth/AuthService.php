<?php

namespace App\Services\Auth;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use App\Models\UserProfile;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthService
{
    /**
     * Login user with email and password
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new \Exception('Incorrect email or password');
        }

        if (! $user->is_active) {
            throw new \Exception('The account is inactive', 403);
        }

        Auth::login($user);

        $token = $user->createToken('api-token')->plainTextToken;

        $user->update(['last_login_at' => now()]);
        $user->load('profile');

        ActivityLogger::log(
            'login',
            'Auth',
            'User logged in successfully',
            null,
            null,
            $user
        );

        return [
            'token' => $token,
            'user' => $user,
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
                'is_active' => false,
            ]);

            $this->sendActivationEmail($user->email);

            DB::commit();

            ActivityLogger::log(
                'register',
                'Auth',
                'New user registered successfully, pending activation',
                ['email' => $user->email],
                null,
                $user
            );

            return [
                'user' => $user,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Gagal melakukan registrasi: '.$e->getMessage());
        }
    }

    /**
     * Send activation link to user's email
     */
    public function sendActivationEmail(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('Email is not registered');
        }

        if ($user->is_active) {
            throw new \Exception('Account is already active');
        }

        // Generate a random token
        $token = \Illuminate\Support\Str::random(64);

        // Store the token
        DB::table('email_activation_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $token,
                'created_at' => Carbon::now(),
            ]
        );

        // Send the email
        Mail::to($email)->send(new \App\Mail\ActivationMail($token, $email));
    }

    /**
     * Activate user account using token
     */
    public function activateAccount(string $email, string $token): User
    {
        $record = DB::table('email_activation_tokens')
            ->where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$record) {
            throw new \Exception('Invalid or expired activation link');
        }

        // Check if token is expired (e.g., 24 hours)
        $createdAt = Carbon::parse($record->created_at);
        if (Carbon::now()->diffInHours($createdAt) > 24) {
            DB::table('email_activation_tokens')->where('email', $email)->delete();
            throw new \Exception('Activation link has expired. Please register again or request a new link.');
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User not found');
        }

        try {
            DB::beginTransaction();

            $user->update(['is_active' => true]);

            // Delete the token
            DB::table('email_activation_tokens')->where('email', $email)->delete();

            ActivityLogger::log(
                'activate_account',
                'Auth',
                'User account activated successfully',
                null,
                null,
                $user
            );

            DB::commit();

            return $user;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Failed to activate account: ' . $e->getMessage());
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
                    if (! str_starts_with($oldAvatar, 'http')) {
                        $storagePath = storage_path('app/public/'.$oldAvatar);
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

            // Generate slug from full_name if not set yet
            if (empty($user->slug) && ! empty($profileData['full_name'])) {
                $user->update([
                    'slug' => SlugGenerator::generate('users', 'slug', $profileData['full_name']),
                ]);
            }

            DB::commit();

            return $user->load('profile');

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Gagal mengupdate profile: '.$e->getMessage());
        }
    }

    /**
     * Send password reset token to user's email via SMTP
     */
    public function forgotPassword(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw new \Exception('Email is not registered');
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

        if (! $record) {
            throw new \Exception('Password reset token not found');
        }

        // Check if token is expired (60 minutes)
        $createdAt = Carbon::parse($record->created_at);
        if (Carbon::now()->diffInMinutes($createdAt) > 60) {
            // Delete expired token
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            throw new \Exception('Password reset token has expired');
        }

        // Verify the token
        if (! Hash::check($token, $record->token)) {
            throw new \Exception('Password reset token is invalid');
        }

        // Update the user's password
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw new \Exception('User not found');
        }

        $user->update([
            'password' => Hash::make($password),
        ]);

        // Delete the used token
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        // This requires auth context, wait, reset password usually isn't logged in but ActivityLogger will have null user_id
        // We can pass user info manually or we just log with null auth
        ActivityLogger::log(
            'reset_password',
            'Auth',
            "User successfully reset password",
            null,
            null,
            $user
        );
    }

    /**
     * Logout user by deleting current access token
     */
    public function logout(User $user): void
    {
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();

            ActivityLogger::log(
                'logout',
                'Auth',
                'User logged out successfully',
                null,
                null,
                $user
            );
        }
    }

    /**
     * Get current authenticated user with profile
     */
    public function getCurrentUser(User $user): User
    {
        return $user->load('profile')->loadCount(['followers', 'following', 'complaints']);
    }

    /**
     * Change user's password
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw new \Exception('Current password does not match', 400);
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);
    }
}

