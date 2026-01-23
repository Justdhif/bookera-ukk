<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return ApiResponse::unauthorizedResponse(
                'Email atau password salah',
                null,
                401
            );
        }

        if (!$user->is_active) {
            return ApiResponse::forbiddenResponse(
                'Akun tidak aktif',
                null,
                403
            );
        }

        $token = $user->createToken('api-token')->plainTextToken;

        $user->update([
            'last_login_at' => now()
        ]);

        $user->load([
            'profile',
            'studentDetail',
            'teacherDetail',
            'staffDetail'
        ]);

        return ApiResponse::successResponse(
            'Login berhasil',
            [
                'token' => $token,
                'user' => $user
            ]
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::successResponse(
            'Logout berhasil',
            null
        );
    }

    public function me(Request $request)
    {
        $user = $request->user()->load([
            'profile',
            'studentDetail',
            'teacherDetail',
            'staffDetail'
        ]);

        return ApiResponse::successResponse(
            'Data user',
            [
                'user' => $user
            ]
        );
    }
}
