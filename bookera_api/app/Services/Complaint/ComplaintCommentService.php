<?php

namespace App\Services\Complaint;

use App\Models\Complaint;
use App\Models\ComplaintComment;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ComplaintCommentService
{
    public function getComments(int $complaintId, int $perPage = 15): LengthAwarePaginator
    {
        return ComplaintComment::with(['user.profile', 'replies'])->withCount('replies')
            ->where('complaint_id', $complaintId)
            ->whereNull('parent_id')
            ->latest()
            ->paginate($perPage);
    }

    public function createComment(User $user, Complaint $complaint, array $data): ComplaintComment
    {
        return DB::transaction(function () use ($user, $complaint, $data) {
            $imagePath = null;
            if (isset($data['image']) && $data['image']) {
                $imagePath = $data['image']->store('complaints/comments', 'public');
            }

            $comment = ComplaintComment::create([
                'user_id'      => $user->id,
                'complaint_id'   => $complaint->id,
                'parent_id'    => $data['parent_id'] ?? null,
                'content'      => $data['content'],
                'image'        => $imagePath,
            ]);

            $comment->load('user.profile');

            if ($user->role === 'admin' && $complaint->user_id !== $user->id) {
                (new ComplaintNotificationService())->notifyComplaintCommentedByAdmin($complaint, $comment);
            }

            return $comment;
        });
    }

    public function deleteComment(User $user, ComplaintComment $comment): void
    {
        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            throw new \Exception('Unauthorized', 403);
        }

        DB::transaction(function () use ($comment) {
            $comment->delete();
        });
    }
}
