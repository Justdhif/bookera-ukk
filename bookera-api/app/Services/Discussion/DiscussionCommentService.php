<?php

namespace App\Services\Discussion;

use App\Events\DiscussionPostUpdated;
use App\Models\DiscussionComment;
use App\Models\DiscussionPost;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DiscussionCommentService
{
    public function getComments(DiscussionPost $post, int $perPage = 20): LengthAwarePaginator
    {
        return DiscussionComment::with(['user.profile', 'replies.user.profile'])
            ->where('post_id', $post->id)
            ->whereNull('parent_id')
            ->latest()
            ->paginate($perPage);
    }

    public function getReplies(DiscussionComment $comment, int $perPage = 20): LengthAwarePaginator
    {
        return DiscussionComment::with(['user.profile'])
            ->where('parent_id', $comment->id)
            ->oldest()
            ->paginate($perPage);
    }

    public function addComment(User $user, DiscussionPost $post, string $content, ?int $parentId = null): DiscussionComment
    {
        $parent = null;
        if ($parentId !== null) {
            $parent = DiscussionComment::where('id', $parentId)
                ->where('post_id', $post->id)
                ->firstOrFail();
        }

        $comment = DiscussionComment::create([
            'user_id'   => $user->id,
            'post_id'   => $post->id,
            'parent_id' => $parent?->id,
            'content'   => $content,
        ]);

        $post->increment('comments_count');

        $actorName = $user->profile?->full_name ?? $user->email;

        if ($parent === null && $post->user_id !== $user->id) {
            Notification::create([
                'user_id' => $post->user_id,
                'title'   => 'Komentar baru di postinganmu',
                'message' => "{$actorName} mengomentari postinganmu.",
                'type'    => 'discussion_comment',
                'module'  => 'discussion',
                'data'    => [
                    'post_id'    => $post->id,
                    'post_slug'  => $post->slug,
                    'comment_id' => $comment->id,
                    'actor_id'   => $user->id,
                ],
            ]);
        }

        if ($parent !== null && $parent->user_id !== $user->id) {
            Notification::create([
                'user_id' => $parent->user_id,
                'title'   => 'Balasan komentar baru',
                'message' => "{$actorName} membalas komentarmu.",
                'type'    => 'discussion_reply',
                'module'  => 'discussion',
                'data'    => [
                    'post_id'    => $post->id,
                    'post_slug'  => $post->slug,
                    'comment_id' => $comment->id,
                    'parent_id'  => $parent->id,
                    'actor_id'   => $user->id,
                ],
            ]);
        }

        // Broadcast post update
        $post->refresh();
        broadcast(new DiscussionPostUpdated(
            $post->slug,
            $post->likes_count,
            $post->comments_count
        ));

        return $comment->load('user.profile');
    }

    public function deleteComment(User $user, DiscussionComment $comment): void
    {
        if ($comment->user_id !== $user->id) {
            throw new \Exception('Unauthorized: you do not own this comment.', 403);
        }

        $replyCount = DiscussionComment::where('parent_id', $comment->id)->count();
        $comment->post()->decrement('comments_count', $replyCount + 1);

        $comment->delete();

        // Broadcast post update
        $post = $comment->post;
        $post->refresh();
        broadcast(new DiscussionPostUpdated(
            $post->slug,
            $post->likes_count,
            $post->comments_count
        ));
    }

    public function updateComment(User $user, DiscussionComment $comment, string $content): DiscussionComment
    {
        if ($comment->user_id !== $user->id) {
            throw new \Exception('Unauthorized: you do not own this comment.', 403);
        }

        $comment->update(['content' => $content]);

        return $comment->load('user.profile');
    }
}
