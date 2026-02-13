<?php

namespace App\Services\User;

use App\Helpers\ActivityLogger;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserService
{
    public function getUsers(array $filters): Collection
    {
        $query = User::with('profile');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhereHas('profile', function ($profileQuery) use ($search) {
                        $profileQuery->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['status'])) {
            $isActive = $filters['status'] === 'active';
            $query->where('is_active', $isActive);
        }

        if (!empty($filters['active'])) {
            $query->where('is_active', true);
        }

        return $query->latest()->get();
    }

    public function getUserById(User $user): User
    {
        return $user->load('profile');
    }

    public function getUserByIdentificationNumber(string $identificationNumber): User
    {
        return User::with('profile')
            ->whereHas('profile', function ($query) use ($identificationNumber) {
                $query->where('identification_number', $identificationNumber);
            })
            ->firstOrFail();
    }

    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $isActive = true;
            if (isset($data['is_active'])) {
                $isActive = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'is_active' => $isActive,
            ]);

            $avatarPath = $this->handleAvatar($data['avatar'] ?? null);

            $user->profile()->create([
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
                'bio' => $data['bio'] ?? null,
                'identification_number' => $data['identification_number'] ?? null,
                'occupation' => $data['occupation'] ?? null,
                'institution' => $data['institution'] ?? null,
                'avatar' => $avatarPath,
            ]);

            $user->load('profile');

            ActivityLogger::log(
                'create',
                'user',
                "Created user: {$user->email} (Role: {$user->role})",
                $user->toArray(),
                null,
                $user
            );

            return $user;
        });
    }

    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $isActive = $user->is_active;
            if (isset($data['is_active'])) {
                $isActive = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            $userData = [
                'email' => $data['email'],
                'role' => $data['role'],
                'is_active' => $isActive,
            ];

            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }

            $user->update($userData);

            $avatarPath = $user->profile->getRawOriginal('avatar') ?? null;
            $oldAvatarPath = $avatarPath;

            if (isset($data['avatar'])) {
                $avatarPath = $this->handleAvatar($data['avatar'], $oldAvatarPath);
            }

            $profileData = [
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
                'bio' => $data['bio'] ?? null,
                'identification_number' => $data['identification_number'] ?? null,
                'occupation' => $data['occupation'] ?? null,
                'institution' => $data['institution'] ?? null,
            ];

            if (isset($data['avatar'])) {
                $profileData['avatar'] = $avatarPath;
            }

            if ($user->profile) {
                $user->profile->update($profileData);
            } else {
                $profileData['avatar'] = $avatarPath;
                $user->profile()->create($profileData);
            }

            $user->load('profile');

            ActivityLogger::log(
                'update',
                'user',
                "Updated user: {$user->email} (Role: {$user->role})",
                $user->toArray(),
                $userData,
                $user
            );

            return $user;
        });
    }

    public function deleteUser(User $user): void
    {
        $userData = $user->toArray();
        $userEmail = $user->email;

        if ($user->profile && $user->profile->getRawOriginal('avatar')) {
            $avatarPath = $user->profile->getRawOriginal('avatar');
            if (!filter_var($avatarPath, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($avatarPath);
            }
        }

        $user->delete();

        ActivityLogger::log(
            'delete',
            'user',
            "Deleted user: {$userEmail}",
            null,
            $userData,
            null
        );
    }

    private function handleAvatar($avatar, ?string $oldAvatarPath = null): ?string
    {
        if ($avatar instanceof UploadedFile) {
            if ($oldAvatarPath && !filter_var($oldAvatarPath, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($oldAvatarPath);
            }
            return $avatar->store('avatars', 'public');
        }

        if (is_string($avatar) && filter_var($avatar, FILTER_VALIDATE_URL)) {
            if ($oldAvatarPath && !filter_var($oldAvatarPath, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($oldAvatarPath);
            }
            return $avatar;
        }

        return null;
    }
}
