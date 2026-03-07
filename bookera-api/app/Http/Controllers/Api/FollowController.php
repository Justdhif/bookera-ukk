<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
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

    public function follow(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:author,publisher',
            'id'   => 'required|integer|min:1',
        ]);

        $follow = $this->followService->follow($validated['type'], $validated['id']);

        return ApiResponse::successResponse('Berhasil mengikuti', ['follow_id' => $follow->id], 201);
    }

    public function unfollow(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:author,publisher',
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
            'type' => 'required|in:author,publisher',
            'id'   => 'required|integer|min:1',
        ]);

        $isFollowing = $this->followService->isFollowing($validated['type'], $validated['id']);

        return ApiResponse::successResponse('Status follow', ['is_following' => $isFollowing]);
    }

    public function authorDetail(string $slug): JsonResponse
    {
        $author = $this->followService->getFollowedAuthorDetail($slug);

        if (!$author) {
            return ApiResponse::errorResponse('Penulis tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Detail penulis berhasil diambil', $author);
    }

    public function publisherDetail(string $slug): JsonResponse
    {
        $publisher = $this->followService->getFollowedPublisherDetail($slug);

        if (!$publisher) {
            return ApiResponse::errorResponse('Penerbit tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Detail penerbit berhasil diambil', $publisher);
    }
}
