<?php

namespace App\Services\News;

use App\Models\News;
use App\Models\NewsComment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NewsService
{
    /**
     * Get all news with optional filtering.
     */
    public function getAllNews(array $filters): LengthAwarePaginator
    {
        $query = News::query()
            ->with(['admin.profile'])
            ->withCount(['allComments as comments_count']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Get news by slug.
     */
    public function getNewsBySlug(string $slug): ?News
    {
        return News::where('slug', $slug)
            ->with(['admin.profile'])
            ->withCount(['allComments as comments_count'])
            ->first();
    }

    /**
     * Create new news.
     */
    public function createNews(array $data): News
    {
        $data['slug'] = $this->generateUniqueSlug($data['title']);
        
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['image'] = $data['image']->store('news', 'public');
        }

        return News::create($data);
    }

    /**
     * Update existing news.
     */
    public function updateNews(News $news, array $data): News
    {
        if (isset($data['title']) && $data['title'] !== $news->title) {
            $data['slug'] = $this->generateUniqueSlug($data['title']);
        }

        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $data['image'] = $data['image']->store('news', 'public');
        }

        $news->update($data);
        return $news;
    }

    /**
     * Delete news.
     */
    public function deleteNews(News $news): bool
    {
        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }
        
        // Delete all comment images
        $news->allComments()->whereNotNull('image')->get()->each(function ($comment) {
            Storage::disk('public')->delete($comment->image);
        });

        return $news->delete();
    }

    /**
     * Get comments for a news.
     */
    public function getNewsComments(int $newsId, array $params = []): LengthAwarePaginator
    {
        return NewsComment::where('news_id', $newsId)
            ->whereNull('parent_id')
            ->with(['user.profile', 'replies.user.profile'])
            ->latest()
            ->paginate($params['per_page'] ?? 15);
    }

    /**
     * Create a comment for news.
     */
    public function createComment(int $newsId, array $data): NewsComment
    {
        $data['news_id'] = $newsId;
        
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['image'] = $data['image']->store('news/comments', 'public');
        }

        return NewsComment::create($data);
    }

    /**
     * Delete a comment.
     */
    public function deleteComment(NewsComment $comment): bool
    {
        if ($comment->image) {
            Storage::disk('public')->delete($comment->image);
        }
        return $comment->delete();
    }

    /**
     * Generate a unique slug for news.
     */
    private function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (News::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }
}
