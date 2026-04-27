<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\Public\PublicDiscussionService;
use Illuminate\Http\JsonResponse;

class PublicDiscussionController extends Controller
{
    private PublicDiscussionService $publicDiscussionService;

    public function __construct(PublicDiscussionService $publicDiscussionService)
    {
        $this->publicDiscussionService = $publicDiscussionService;
    }

    /**
     * Display a listing of top discussions.
     */
    public function topDiscussions(): JsonResponse
    {
        $discussions = $this->publicDiscussionService->getTopDiscussions(10);

        return ApiResponse::successResponse('Top discussions retrieved successfully', $discussions);
    }

    /**
     * Display a listing of all discussions.
     */
    public function index(): JsonResponse
    {
        $perPage = request('per_page', 12);
        $discussions = $this->publicDiscussionService->getAll($perPage);

        return ApiResponse::successResponse('Discussions retrieved successfully', $discussions);
    }
}
