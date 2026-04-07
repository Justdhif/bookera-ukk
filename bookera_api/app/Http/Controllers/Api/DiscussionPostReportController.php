<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\DiscussionPost;
use App\Models\DiscussionPostReport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussionPostReportController extends Controller
{
    /**
     * POST /discussion-posts/{slug}/report
     * Authenticated user reports a post.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $post = DiscussionPost::where('slug', $slug)->firstOrFail();

        if ($post->user_id === $user->id) {
            return ApiResponse::errorResponse('Kamu tidak dapat melaporkan postinganmu sendiri.', null, 422);
        }

        $validated = $request->validate([
            'reason' => 'required|in:spam,harassment,hate_speech,misinformation,inappropriate_content,other',
            'description' => 'nullable|required_if:reason,other|string|max:1000',
        ]);

        $alreadyReported = DiscussionPostReport::where('reporter_id', $user->id)
            ->where('post_id', $post->id)
            ->exists();

        if ($alreadyReported) {
            return ApiResponse::errorResponse('Kamu sudah melaporkan postingan ini sebelumnya.', null, 422);
        }

        $report = DiscussionPostReport::create([
            'reporter_id' => $user->id,
            'post_id' => $post->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        return ApiResponse::successResponse('Laporan berhasil dikirim.', $report, 201);
    }

    /**
     * GET /admin/discussion-posts/reports
     * Admin: list all reports.
     */
    public function index(Request $request): JsonResponse
    {
        $query = DiscussionPostReport::with([
            'reporter.profile',
            'post.user.profile',
            'post.images',
            'reviewer.profile',
        ])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $reports = $query->paginate($request->get('per_page', 15));

        return ApiResponse::successResponse('Daftar laporan berhasil diambil.', $reports);
    }

    /**
     * PATCH /admin/discussion-posts/reports/{report}
     * Admin: review a report — mark as reviewed/dismissed + optionally takedown the post.
     */
    public function update(Request $request, DiscussionPostReport $report): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:reviewed,dismissed',
            'admin_note' => 'nullable|string|max:1000',
            'takedown' => 'boolean',
            'takedown_reason' => 'nullable|string|max:500',
        ]);

        /** @var User $user */
        $user = $request->user();

        $report->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        // If admin chose to takedown the post
        if (! empty($validated['takedown'])) {
            $report->post->update([
                'taken_down_at' => now(),
                'taken_down_reason' => $validated['takedown_reason'] ?? null,
            ]);
        }

        $report->load(['reporter.profile', 'post.user.profile', 'post.images', 'reviewer.profile']);

        return ApiResponse::successResponse('Laporan berhasil diperbarui.', $report);
    }

    /**
     * PATCH /admin/discussion-posts/{slug}/takedown
     * Admin: directly takedown a post.
     */
    public function takedown(Request $request, string $slug): JsonResponse
    {
        $post = DiscussionPost::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $post->update([
            'taken_down_at' => now(),
            'taken_down_reason' => $validated['reason'] ?? null,
        ]);

        return ApiResponse::successResponse('Postingan berhasil di-takedown.', $post);
    }

    /**
     * PATCH /admin/discussion-posts/{slug}/restore
     * Admin: restore a taken-down post.
     */
    public function restore(string $slug): JsonResponse
    {
        $post = DiscussionPost::where('slug', $slug)->firstOrFail();

        $post->update([
            'taken_down_at' => null,
            'taken_down_reason' => null,
        ]);

        return ApiResponse::successResponse('Postingan berhasil dipulihkan.', $post);
    }
}
