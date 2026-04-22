<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Complaint\StoreComplaintCommentRequest;
use App\Models\Complaint;
use App\Models\ComplaintComment;
use App\Services\Complaint\ComplaintCommentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintCommentController extends Controller
{
    public function __construct(private ComplaintCommentService $commentService) {}

    public function index(Request $request, string $slug): JsonResponse
    {
        try {
            $complaint = Complaint::where('slug', $slug)->firstOrFail();
            $comments = $this->commentService->getComments(
                $complaint->id,
                (int) $request->get('per_page', 15)
            );

            return ApiResponse::successResponse('Comments retrieved successfully', $comments);
        } catch (ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Complaint not found');
        }
    }

    public function store(StoreComplaintCommentRequest $request, string $slug): JsonResponse
    {
        try {
            $user = $request->user();
            $complaint = Complaint::where('slug', $slug)->firstOrFail();
            
            $comment = $this->commentService->createComment($user, $complaint, [
                'content'   => $request->input('content'),
                'parent_id' => $request->input('parent_id'),
            ]);

            return ApiResponse::successResponse('Comment added successfully', $comment, 201);
        } catch (ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Complaint not found');
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $comment = ComplaintComment::findOrFail($id);
            $this->commentService->deleteComment($user, $comment);

            return ApiResponse::successResponse('Comment deleted successfully');
        } catch (ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Comment not found');
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, $e->getCode() ?: 400);
        }
    }
}
