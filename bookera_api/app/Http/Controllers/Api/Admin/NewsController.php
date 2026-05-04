<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\News\StoreNewsRequest;
use App\Http\Requests\News\UpdateNewsRequest;
use App\Models\News;
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
     * Store a newly created news.
     */
    public function store(StoreNewsRequest $request)
    {
        $data = $request->validated();
        $user = Auth::user();
        if (!$user) {
            return ApiResponse::errorResponse('Unauthenticated', 401);
        }
        $data['admin_id'] = $user->id;

        $news = $this->newsService->createNews($data);

        return ApiResponse::successResponse('News created successfully', $news);
    }

    /**
     * Update the specified news.
     */
    public function update(UpdateNewsRequest $request, News $news)
    {
        $news = $this->newsService->updateNews($news, $request->validated());

        return ApiResponse::successResponse('News updated successfully', $news);
    }

    /**
     * Remove the specified news.
     */
    public function destroy(News $news)
    {
        $this->newsService->deleteNews($news);

        return ApiResponse::successResponse('News deleted successfully');
    }
}
