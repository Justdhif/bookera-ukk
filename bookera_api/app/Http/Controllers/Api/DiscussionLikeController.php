<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\DiscussionPost;
use App\Services\Discussion\DiscussionLikeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussionLikeController extends Controller
{
    public function __construct(private DiscussionLikeService $likeService) {}

    /**
     * POST /discussion-posts/{slug}/like  — toggle like (auth required)
     */
    public function toggle(Request $request, string $slug): JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = $request->user();

            $post = DiscussionPost::where('slug', $slug)->firstOrFail();
            $result = $this->likeService->toggle($user, $post);

            return ApiResponse::successResponse('Like toggled successfully', $result);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Post not found');
        }
    }
}
