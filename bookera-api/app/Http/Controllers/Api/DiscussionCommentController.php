<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Discussion\StoreDiscussionCommentRequest;
use App\Http\Requests\Discussion\UpdateDiscussionCommentRequest;
use App\Models\DiscussionComment;
use App\Models\DiscussionPost;
use App\Services\Discussion\DiscussionCommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussionCommentController extends Controller
{
    public function __construct(private DiscussionCommentService $commentService) {}

    public function index(Request $request, string $slug): JsonResponse
    {
        try {
            $post     = DiscussionPost::where('slug', $slug)->firstOrFail();
            $comments = $this->commentService->getComments($post, (int) $request->get('per_page', 20));
            return ApiResponse::successResponse('Comments retrieved successfully', $comments);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Post not found');
        }
    }

    public function replies(Request $request, DiscussionComment $comment): JsonResponse
    {
        $replies = $this->commentService->getReplies($comment, (int) $request->get('per_page', 20));
        return ApiResponse::successResponse('Replies retrieved successfully', $replies);
    }

    public function store(StoreDiscussionCommentRequest $request, string $slug): JsonResponse
    {
        try {
            $post    = DiscussionPost::where('slug', $slug)->firstOrFail();
            $comment = $this->commentService->addComment(
                $request->user(),
                $post,
                $request->input('content'),
                $request->input('parent_id')
            );
            return ApiResponse::successResponse('Comment added successfully', $comment, 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Post or parent comment not found');
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 422);
        }
    }

    public function update(UpdateDiscussionCommentRequest $request, DiscussionComment $comment): JsonResponse
    {
        try {
            $updated = $this->commentService->updateComment($request->user(), $comment, $request->input('content'));
            return ApiResponse::successResponse('Comment updated successfully', $updated);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 ? $e->getCode() : 403;
            return ApiResponse::errorResponse($e->getMessage(), null, $code);
        }
    }

    public function destroy(Request $request, DiscussionComment $comment): JsonResponse
    {
        try {
            $this->commentService->deleteComment($request->user(), $comment);
            return ApiResponse::successResponse('Comment deleted successfully');
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 ? $e->getCode() : 403;
            return ApiResponse::errorResponse($e->getMessage(), null, $code);
        }
    }
}
