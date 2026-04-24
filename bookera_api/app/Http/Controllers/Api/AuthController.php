<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SetupProfile;
use App\Http\Requests\Auth\ChangePasswordRequest;
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

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->login(
                $request->email,
                $request->password
            );

            return ApiResponse::successResponse('Login successful', $data);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 403 ? 403 : 401;

            if ($statusCode === 403) {
                return ApiResponse::forbiddenResponse($e->getMessage(), null, 403);
            }

            return ApiResponse::unauthorizedResponse($e->getMessage(), null, 401);
        }
    }

    /**
     * Register new user (email + password only)
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $userData = [
                'email' => $request->email,
                'password' => $request->password,
            ];

            $data = $this->authService->register($userData);

            return ApiResponse::successResponse('Registration successful', $data, 201);
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $prefix = 'Gagal melakukan registrasi: ';

            if (str_starts_with($message, $prefix)) {
                $message = substr($message, strlen($prefix));
            }

            return ApiResponse::errorResponse('Registration failed: :message', [
                'message' => $message,
            ], 500);
        }
    }

    /**
     * Setup or update user profile (requires authentication)
     */
    public function setupProfile(SetupProfile $request): JsonResponse
    {
        try {
            $user = $this->authService->setupProfile(
                $request->user(),
                $request->except('avatar'),
                $request->file('avatar')
            );

            return ApiResponse::successResponse('Profile updated successfully', [
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $prefix = 'Gagal mengupdate profile: ';

            if (str_starts_with($message, $prefix)) {
                $message = substr($message, strlen($prefix));
            }

            return ApiResponse::errorResponse('Failed to update profile: :message', [
                'message' => $message,
            ], 500);
        }
    }

    /**
     * Send password reset token to email
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $this->authService->forgotPassword($request->email);

            return ApiResponse::successResponse('Verification code has been sent to your email',
                ['email' => $request->email]
            );
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Reset password using token
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $this->authService->resetPassword(
                $request->email,
                $request->token,
                $request->password
            );

            return ApiResponse::successResponse('Password has been reset. Please log in with your new password.');
        } catch (\Exception $e) {
            $statusCode = 400;

            if (str_contains($e->getMessage(), 'kadaluarsa')) {
                $statusCode = 410; // Gone
            } elseif (str_contains($e->getMessage(), 'tidak valid') || str_contains($e->getMessage(), 'tidak ditemukan')) {
                $statusCode = 422; // Unprocessable Entity
            }

            return ApiResponse::errorResponse($e->getMessage(), $statusCode);
        }
    }

    /**
     * Activate user account
     */
    public function activate(Request $request): JsonResponse
    {
        try {
            $user = $this->authService->activateAccount(
                $request->email,
                $request->token
            );

            return ApiResponse::successResponse('Account activated successfully', [
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Resend activation email
     */
    public function resendActivation(Request $request): JsonResponse
    {
        try {
            $this->authService->sendActivationEmail($request->email);

            return ApiResponse::successResponse('Activation link has been resent to your email');
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return ApiResponse::successResponse('Logout successful', null);
    }

    /**
     * Get current authenticated user data
     */
    public function me(Request $request): JsonResponse
    {
        $user = $this->authService->getCurrentUser($request->user());

        return ApiResponse::successResponse('User data', ['user' => $user]);
    }

    /**
     * Change user password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $this->authService->changePassword(
                $request->user(),
                $request->current_password,
                $request->password
            );

            return ApiResponse::successResponse('Password changed successfully');
        } catch (\Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            return ApiResponse::errorResponse($e->getMessage(), $statusCode);
        }
    }
}
