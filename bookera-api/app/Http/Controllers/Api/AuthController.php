<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
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

