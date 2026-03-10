"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DiscussionPost } from "@/types/discussion";
import { useAuthStore } from "@/store/auth.store";
import PostImageCarousel from "./PostImageCarousel";
import PostDetailPanel from "./post-detail/PostDetailPanel";

interface Props {
  post: DiscussionPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (postId: number) => void;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
  onLikedChange?: (liked: boolean) => void;
}

export default function PostCommentDialog({
  post: initialPost,
  open,
  onOpenChange,
  onDeleted,
  onCommentAdded,
  onCommentDeleted,
  onLikedChange,
}: Props) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(initialPost.is_liked);
  const [likesCount, setLikesCount] = useState(initialPost.likes_count);
  const [commentsCount, setCommentsCount] = useState(initialPost.comments_count);

  // Reset state when post changes or dialog opens
  useEffect(() => {
    if (open) {
      setLiked(initialPost.is_liked);
      setLikesCount(initialPost.likes_count);
      setCommentsCount(initialPost.comments_count);
    }
  }, [initialPost.slug, initialPost.is_liked, initialPost.likes_count, initialPost.comments_count, open]);

  // Listen to real-time post updates
  useEffect(() => {
    if (!open) return;

    const handlePostUpdate = (event: CustomEvent<{
      slug: string;
      likesCount: number;
      commentsCount: number;
      userId?: number;
      action?: 'liked' | 'unliked';
    }>) => {
      if (event.detail.slug === initialPost.slug) {
        setLikesCount(event.detail.likesCount);
        setCommentsCount(event.detail.commentsCount);
        
        // Update liked status if this is the current user's action
        if (event.detail.userId === user?.id && event.detail.action) {
          const newLiked = event.detail.action === 'liked';
          setLiked(newLiked);
          // Notify parent component
          onLikedChange?.(newLiked);
        }
      }
    };

    window.addEventListener("discussion-post-updated", handlePostUpdate as EventListener);
    return () => {
      window.removeEventListener("discussion-post-updated", handlePostUpdate as EventListener);
    };
  }, [initialPost.slug, user?.id, open]);

  // Create updated post object with current state
  const post = useMemo(() => ({
    ...initialPost,
    is_liked: liked,
    likes_count: likesCount,
    comments_count: commentsCount,
  }), [initialPost, liked, likesCount, commentsCount]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl p-0 gap-0 overflow-hidden rounded-2xl [&>button]:z-50 h-[92vh] md:h-[88vh]">
        <DialogTitle className="sr-only">
          {post.user.profile?.full_name ?? post.user.email}
        </DialogTitle>

        <div className="flex h-full">
          {/* Left — image carousel (fills full height) */}
          {post.images.length > 0 && (
            <div className="hidden md:block md:w-[55%] shrink-0 bg-black relative">
              <PostImageCarousel
                images={post.images}
                className="rounded-none"
                fillHeight
              />
            </div>
          )}

          {/* Right — author, caption, comments */}
          <div
            className={cn(
              "flex flex-col h-full overflow-hidden",
              post.images.length > 0
                ? "flex-1 border-l border-border/40"
                : "w-full",
            )}
          >
            <PostDetailPanel
              post={post}
              onDeleted={() => {
                onOpenChange(false);
                onDeleted?.(initialPost.id);
              }}
              onCommentAdded={() => {
                setCommentsCount((prev) => prev + 1);
                onCommentAdded?.();
              }}
              onCommentDeleted={() => {
                setCommentsCount((prev) => Math.max(0, prev - 1));
                onCommentDeleted?.();
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
