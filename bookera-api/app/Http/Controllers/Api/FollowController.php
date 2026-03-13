<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Follow\FollowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function __construct(private FollowService $followService) {}

    public function authors(): JsonResponse
    {
        $authors = $this->followService->getFollowedAuthors();

        return ApiResponse::successResponse('Daftar penulis yang diikuti berhasil diambil', $authors);
    }

    public function publishers(): JsonResponse
    {
        $publishers = $this->followService->getFollowedPublishers();

        return ApiResponse::successResponse('Daftar penerbit yang diikuti berhasil diambil', $publishers);
    }

    public function users(): JsonResponse
    {
        $users = $this->followService->getFollowedUsers();

        return ApiResponse::successResponse('Daftar pengguna yang diikuti berhasil diambil', $users);
    }

    public function follow(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:author,publisher,user',
            'id'   => 'required|integer|min:1',
        ]);

        try {
            $follow = $this->followService->follow($validated['type'], $validated['id']);
            return ApiResponse::successResponse('Berhasil mengikuti', ['follow_id' => $follow->id], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Data tidak ditemukan');
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 ? $e->getCode() : 422;
            return ApiResponse::errorResponse($e->getMessage(), null, $code);
        }
    }

    public function unfollow(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:author,publisher,user',
            'id'   => 'required|integer|min:1',
        ]);

        $result = $this->followService->unfollow($validated['type'], $validated['id']);

        if (!$result) {
            return ApiResponse::errorResponse('Tidak sedang mengikuti', null, 404);
        }

        return ApiResponse::successResponse('Berhasil berhenti mengikuti', null);
    }

    public function check(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:author,publisher,user',
            'id'   => 'required|integer|min:1',
        ]);

        $isFollowing = $this->followService->isFollowing($validated['type'], $validated['id']);

        return ApiResponse::successResponse('Status follow', ['is_following' => $isFollowing]);
    }

    public function authorDetail(string $slug): JsonResponse
    {
        return $this->followableDetail('author', $slug);
    }

    public function publisherDetail(string $slug): JsonResponse
    {
        return $this->followableDetail('publisher', $slug);
    }

    private function followableDetail(string $type, string $slug): JsonResponse
    {
        $detail = $this->followService->getFollowableDetail($type, $slug);

        if (!$detail) {
            $label = $type === 'author' ? 'Penulis' : 'Penerbit';
            return ApiResponse::errorResponse("{$label} tidak ditemukan", null, 404);
        }

        $label = $type === 'author' ? 'Penulis' : 'Penerbit';
        return ApiResponse::successResponse("Detail {$label} berhasil diambil", $detail);
    }

    // ── User-follow public endpoints ─────────────────────────────────────────

    public function userFollowers(Request $request, string $userSlug): JsonResponse
    {
        try {
            $followers = $this->followService->getUserFollowers($userSlug, (int) $request->get('per_page', 20));
            return ApiResponse::successResponse('Daftar pengikut berhasil diambil', $followers);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Pengguna tidak ditemukan');
        }
    }

    public function userFollowing(Request $request, string $userSlug): JsonResponse
    {
        try {
            $following = $this->followService->getUserFollowing($userSlug, (int) $request->get('per_page', 20));
            return ApiResponse::successResponse('Daftar following berhasil diambil', $following);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Pengguna tidak ditemukan');
        }
    }

    public function userFollowCounts(string $userSlug): JsonResponse
    {
        try {
            $counts = $this->followService->getUserFollowCounts($userSlug);
            return ApiResponse::successResponse('Jumlah follower berhasil diambil', $counts);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Pengguna tidak ditemukan');
        }
    }

    public function userPublicProfile(string $userSlug): JsonResponse
    {
        $user = User::with('profile')->where('slug', $userSlug)->firstOrFail();

        return ApiResponse::successResponse('Profil pengguna berhasil diambil', $user);
    }
}
