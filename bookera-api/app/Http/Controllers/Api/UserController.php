<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('profile');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhereHas('profile', function ($profileQuery) use ($search) {
                        $profileQuery->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        // Filter active users only
        if ($request->has('active') && $request->active) {
            $query->where('is_active', true);
        }

        $users = $query->latest()->get();

        return ApiResponse::successResponse(
            'Data user berhasil diambil',
            $users
        );
    }

    public function show(User $user)
    {
        $user->load('profile');

        return ApiResponse::successResponse(
            'Detail user',
            $user
        );
    }

    public function showByIdentification($identificationNumber)
    {
        $user = User::with('profile')
            ->whereHas('profile', function ($query) use ($identificationNumber) {
                $query->where('identification_number', $identificationNumber);
            })
            ->firstOrFail();

        return ApiResponse::successResponse(
            'Detail user',
            $user
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => ['required', Rule::in(['admin', 'officer', 'user'])],
            'is_active' => 'nullable|in:true,false,1,0',

            // Profile fields
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
        ]);

        try {
            DB::beginTransaction();

            // Convert is_active to boolean
            $isActive = true;
            if ($request->has('is_active')) {
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            }

            // Create user
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_active' => $isActive,
            ]);

            // Handle avatar (could be file upload or URL string)
            $avatarPath = null;
            if ($request->hasFile('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
            } elseif ($request->filled('avatar') && filter_var($request->avatar, FILTER_VALIDATE_URL)) {
                // If avatar is a valid URL, use it directly
                $avatarPath = $request->avatar;
            }

            // Create profile
            $user->profile()->create([
                'full_name' => $request->full_name,
                'gender' => $request->gender,
                'birth_date' => $request->birth_date,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'bio' => $request->bio,
                'identification_number' => $request->identification_number,
                'occupation' => $request->occupation,
                'institution' => $request->institution,
                'avatar' => $avatarPath,
            ]);

            DB::commit();

            $user->load('profile');

            return ApiResponse::successResponse(
                'User berhasil dibuat',
                $user,
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded avatar if transaction fails
            if (isset($avatarPath) && $avatarPath) {
                Storage::disk('public')->delete($avatarPath);
            }

            return ApiResponse::errorResponse(
                'Gagal membuat user: ' . $e->getMessage(),
                null,
                500
            );
        }
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|min:6',
            'role' => ['required', Rule::in(['admin', 'officer', 'user'])],
            'is_active' => 'nullable|in:true,false,1,0',

            // Profile fields
            'full_name' => 'required|string|max:255',
            'gender' => ['nullable', Rule::in(['male', 'female', 'prefer_not_to_say'])],
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'bio' => 'nullable|string',
            'identification_number' => ['nullable', 'string', Rule::unique('user_profiles', 'identification_number')->ignore($user->profile->id ?? null)],
            'occupation' => 'nullable|string|max:100',
            'institution' => 'nullable|string|max:255',
            'avatar' => 'nullable',
        ]);

        try {
            DB::beginTransaction();

            // Convert is_active to boolean
            $isActive = $user->is_active;
            if ($request->has('is_active')) {
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            }

            // Update user
            $userData = [
                'email' => $request->email,
                'role' => $request->role,
                'is_active' => $isActive,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            // Handle avatar (could be file upload or URL string)
            $avatarPath = $user->profile->getRawOriginal('avatar') ?? null;
            $oldAvatarPath = $avatarPath;

            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists and is not a URL
                if ($oldAvatarPath && !filter_var($oldAvatarPath, FILTER_VALIDATE_URL)) {
                    Storage::disk('public')->delete($oldAvatarPath);
                }
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
            } elseif ($request->filled('avatar') && filter_var($request->avatar, FILTER_VALIDATE_URL)) {
                // If avatar is a valid URL, use it directly
                // Delete old avatar if exists and is not a URL
                if ($oldAvatarPath && !filter_var($oldAvatarPath, FILTER_VALIDATE_URL)) {
                    Storage::disk('public')->delete($oldAvatarPath);
                }
                $avatarPath = $request->avatar;
            }

            // Update or create profile
            $profileData = [
                'full_name' => $request->full_name,
                'gender' => $request->gender,
                'birth_date' => $request->birth_date,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'bio' => $request->bio,
                'identification_number' => $request->identification_number,
                'occupation' => $request->occupation,
                'institution' => $request->institution,
            ];

            if ($request->has('avatar')) {
                $profileData['avatar'] = $avatarPath;
            }

            if ($user->profile) {
                $user->profile->update($profileData);
            } else {
                $profileData['avatar'] = $avatarPath;
                $user->profile()->create($profileData);
            }

            DB::commit();

            $user->load('profile');

            return ApiResponse::successResponse(
                'User berhasil diupdate',
                $user
            );
        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded avatar if transaction fails
            if (isset($avatarPath) && $avatarPath && $request->hasFile('avatar')) {
                Storage::disk('public')->delete($avatarPath);
            }

            return ApiResponse::errorResponse(
                'Gagal mengupdate user: ' . $e->getMessage(),
                null,
                500
            );
        }
    }

    public function destroy(User $user)
    {
        try {
            // Delete avatar if exists
            if ($user->profile && $user->profile->getRawOriginal('avatar')) {
                Storage::disk('public')->delete($user->profile->getRawOriginal('avatar'));
            }

            // Delete user (profile will be cascade deleted)
            $user->delete();

            return ApiResponse::successResponse(
                'User berhasil dihapus',
                null
            );
        } catch (\Exception $e) {
            return ApiResponse::errorResponse(
                'Gagal menghapus user: ' . $e->getMessage(),
                null,
                500
            );
        }
    }
}
