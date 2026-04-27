<?php

namespace App\Services\Public;

use App\Models\DiscussionPost;
use Illuminate\Database\Eloquent\Collection;

class PublicDiscussionService
{
    /**
     * Get top discussions by likes count.
     *
     * @param int $limit
     * @return Collection
     */
    public function getTopDiscussions(int $limit = 10): Collection
    {
        return DiscussionPost::query()
            ->notTakenDown()
            ->with(['user.profile', 'images'])
            ->orderByDesc('likes_count')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get all discussions with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getAll(int $perPage = 12)
    {
        return DiscussionPost::query()
            ->notTakenDown()
            ->with(['user.profile', 'images'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
