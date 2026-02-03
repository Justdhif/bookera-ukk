<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;

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
        $user->load([
            'profile',
            'studentDetail',
            'teacherDetail',
            'staffDetail',
        ]);

        return ApiResponse::successResponse(
            'Detail user',
            $user
        );
    }
}
