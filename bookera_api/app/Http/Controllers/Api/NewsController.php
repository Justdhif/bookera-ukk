<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\News\StoreNewsCommentRequest;
use App\Models\News;
use App\Models\NewsComment;
use App\Services\News\NewsService;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NewsController extends Controller
{
    protected $newsService;

    public function __construct(NewsService $newsService)
    {
        $this->newsService = $newsService;
    }

    /**
     * Display a listing of news.
     */
    public function index(Request $request)
    {
        $news = $this->newsService->getAllNews($request->all());
        return ApiResponse::successResponse('News retrieved successfully', $news);
    }

    /**
     * Display the specified news.
     */
    public function show(string $slug)
    {
        $news = $this->newsService->getNewsBySlug($slug);

        if (!$news) {
            return ApiResponse::notFoundResponse('News not found');
        }

        return ApiResponse::successResponse('News retrieved successfully', $news);
    }

    /**
     * Get comments for a news.
     */
    public function getComments(Request $request, News $news)
    {
        $comments = $this->newsService->getNewsComments($news->id, $request->all());
        return ApiResponse::successResponse('Comments retrieved successfully', $comments);
    }

    /**
     * Store a comment for a news.
     */
    public function storeComment(StoreNewsCommentRequest $request, News $news)
    {
        $data = $request->validated();
        $user = Auth::user();
        if (!$user) {
            return ApiResponse::errorResponse('Unauthenticated', 401);
        }
        $data['user_id'] = $user->id;

        $comment = $this->newsService->createComment($news->id, $data);
        $comment->load(['user.profile']);

        return ApiResponse::successResponse('Comment added successfully', $comment);
    }

    /**
     * Remove a comment.
     */
    public function destroyComment(NewsComment $comment)
    {
        $user = Auth::user();
        if (!$user || ($comment->user_id !== $user->id && $user->role !== 'admin')) {
            return ApiResponse::errorResponse('Unauthorized', 403);
        }

        $this->newsService->deleteComment($comment);

        return ApiResponse::successResponse('Comment deleted successfully');
    }
}
