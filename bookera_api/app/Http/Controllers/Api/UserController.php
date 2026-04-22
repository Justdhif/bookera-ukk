<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'role'     => $request->role,
            'status'   => $request->status,
            'per_page' => $request->per_page,
        ];

        $users = $this->userService->getAll($filters);

        return ApiResponse::successResponse('User data retrieved successfully', $users);
    }



    public function showBySlug(string $slug): JsonResponse
    {
        try {
            $user = $this->userService->getBySlug($slug);

            return ApiResponse::successResponse('User details', $user);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('User not found', 404);
        }
    }

    public function showByIdentification(string $identificationNumber): JsonResponse
    {
        try {
            $user = $this->userService->getByIdentificationNumber($identificationNumber);

            return ApiResponse::successResponse('User details', $user);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('User not found', 404);
        }
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar');
            } elseif ($request->filled('avatar')) {
                $data['avatar'] = $request->avatar;
            }

            $user = $this->userService->create($data);

            return ApiResponse::successResponse('User created successfully', $user, 201);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Failed to create user: :message', [
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar');
            } elseif ($request->filled('avatar')) {
                $data['avatar'] = $request->avatar;
            }

            $user = $this->userService->update($user, $data);

            return ApiResponse::successResponse('User updated successfully', $user);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Failed to update user: :message', [
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(User $user): JsonResponse
    {
        try {
            $this->userService->delete($user);

            return ApiResponse::successResponse('User deleted successfully', null);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Failed to delete user: :message', [
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
