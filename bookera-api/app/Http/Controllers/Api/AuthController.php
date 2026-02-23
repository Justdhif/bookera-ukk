<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\SetupProfile;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->login(
                $request->email,
                $request->password
            );

            return ApiResponse::successResponse('Login berhasil', $data);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 403 ? 403 : 401;

            if ($statusCode === 403) {
                return ApiResponse::forbiddenResponse($e->getMessage(), null, 403);
            }

            return ApiResponse::unauthorizedResponse($e->getMessage(), null, 401);
        }
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $userData = [
                'email' => $request->email,
                'password' => $request->password,
                'role' => $request->role ?? 'user',
            ];

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

            $data = $this->authService->register($userData, $profileData);

            return ApiResponse::successResponse('Registrasi berhasil', $data, 201);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), 500);
        }
    }

    public function setupProfile(SetupProfile $request): JsonResponse
    {
        try {
            $user = $this->authService->setupProfile(
                $request->user(),
                $request->except('avatar'),
                $request->file('avatar')
            );

            return ApiResponse::successResponse('Profile berhasil diperbarui', [
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Gagal memperbarui profile: ' . $e->getMessage(), 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return ApiResponse::successResponse('Logout berhasil', null);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->authService->getCurrentUser($request->user());

        return ApiResponse::successResponse('Data user', ['user' => $user]);
    }
}

