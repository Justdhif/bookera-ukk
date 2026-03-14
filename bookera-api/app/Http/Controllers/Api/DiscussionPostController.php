<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Discussion\StoreDiscussionPostRequest;
use App\Http\Requests\Discussion\UpdateDiscussionPostRequest;
use App\Models\DiscussionPost;
use App\Models\Follow;
use App\Models\User;
use App\Services\Discussion\DiscussionPostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussionPostController extends Controller
{
    public function __construct(private DiscussionPostService $postService) {}

    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User|null $user */
        $user = auth('sanctum')->user();

        $posts = $this->postService->getPosts(
            $user,
            (int) $request->get('per_page', 15)
        );

        return ApiResponse::successResponse('Posts retrieved successfully', $posts);
    }

    public function byUser(Request $request, string $userSlug): JsonResponse
    {
        try {
            /** @var \App\Models\User|null $user */
            $user = auth('sanctum')->user();

            $posts = $this->postService->getUserPosts(
                $userSlug,
                $user,
                (int) $request->get('per_page', 15)
            );
            return ApiResponse::successResponse('User posts retrieved successfully', $posts);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('User not found');
        }
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        try {
            /** @var \App\Models\User|null $user */
            $user = auth('sanctum')->user();

            $post = $this->postService->getPostBySlug($slug, $user);
            return ApiResponse::successResponse('Post retrieved successfully', $post);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Post not found');
        }
    }

    public function store(StoreDiscussionPostRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $post = $this->postService->createPost($user, [
            'caption' => $request->input('caption'),
            'images'  => $request->file('images'),
        ]);

        return ApiResponse::successResponse('Post created successfully', $post, 201);
    }

    public function update(UpdateDiscussionPostRequest $request, string $slug): JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = $request->user();
            $post = DiscussionPost::where('slug', $slug)->firstOrFail();

            $post = $this->postService->updatePost($user, $post, [
                'caption' => $request->input('caption'),
                'images'  => $request->file('images') ?? [],
            ]);

            return ApiResponse::successResponse('Post updated successfully', $post);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Post not found');
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 ? $e->getCode() : 403;
            return ApiResponse::errorResponse($e->getMessage(), null, $code);
        }
    }

    /**
     * DELETE /discussion-posts/{slug}  — delete a post (auth + owner)
     */
    public function destroy(Request $request, string $slug): JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = $request->user();
            $post = DiscussionPost::where('slug', $slug)->firstOrFail();
            $this->postService->deletePost($user, $post);
            return ApiResponse::successResponse('Post deleted successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Post not found');
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 ? $e->getCode() : 403;
            return ApiResponse::errorResponse($e->getMessage(), null, $code);
        }
    }

    /**
     * GET /discussion-posts/feed/following  — following feed (auth required)
     */
    public function following(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $posts = $this->postService->getFollowingPosts(
            $user,
            (int) $request->get('per_page', 15)
        );

        return ApiResponse::successResponse('Following feed retrieved successfully', $posts);
    }

    /**
     * GET /discussion-posts/active-users  — users who recently posted
     */
    public function activeUsers(Request $request): JsonResponse
    {
        /** @var \App\Models\User|null $authUser */
        $authUser = auth('sanctum')->user();

        $users = User::with('profile')
            ->inRandomOrder()
            ->limit(10)
            ->get();

        $followingIds = collect();
        if ($authUser) {
            $followingIds = Follow::where('user_id', $authUser->id)
                ->whereIn('followable_id', $users->pluck('id'))
                ->where('followable_type', User::class)
                ->pluck('followable_id')
                ->flip();
        }

        $users->each(function (User $user) use ($followingIds) {
            if ($user->profile?->avatar) {
                $user->profile->avatar_url = storage_image($user->profile->avatar);
            }
            $user->setAttribute('is_following', $followingIds->has($user->id));
        });

        return ApiResponse::successResponse('Discussion users retrieved', $users);
    }
}

