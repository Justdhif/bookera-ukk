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
            'search' => $request->search,
            'role' => $request->role,
            'status' => $request->status,
            'active' => $request->active,
        ];

        $users = $this->userService->getUsers($filters);

        return ApiResponse::successResponse('Data user berhasil diambil', $users);
    }

    public function show(User $user): JsonResponse
    {
        $user = $this->userService->getUserById($user);

        return ApiResponse::successResponse('Detail user', $user);
    }

    public function showByIdentification(string $identificationNumber): JsonResponse
    {
        try {
            $user = $this->userService->getUserByIdentificationNumber($identificationNumber);

            return ApiResponse::successResponse('Detail user', $user);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('User tidak ditemukan', 404);
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

            $user = $this->userService->createUser($data);

            return ApiResponse::successResponse('User berhasil dibuat', $user, 201);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Gagal membuat user: ' . $e->getMessage(), null, 500);
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

            $user = $this->userService->updateUser($user, $data);

            return ApiResponse::successResponse('User berhasil diupdate', $user);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Gagal mengupdate user: ' . $e->getMessage(), null, 500);
        }
    }

    public function destroy(User $user): JsonResponse
    {
        try {
            $this->userService->deleteUser($user);

            return ApiResponse::successResponse('User berhasil dihapus', null);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Gagal menghapus user: ' . $e->getMessage(), null, 500);
        }
    }

}

