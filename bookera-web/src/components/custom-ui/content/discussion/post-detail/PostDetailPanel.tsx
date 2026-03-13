"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Pencil,
  Send,
  Shield,
  X,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DiscussionPost } from "@/types/discussion";
import {
  discussionCommentService,
  discussionLikeService,
  discussionPostService,
} from "@/services/discussion.service";
import { useAuthStore } from "@/store/auth.store";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { cn } from "@/lib/utils";
import CommentSection, { CommentSectionHandle } from "../CommentSection";
import ReportPostDialog from "../ReportPostDialog";

interface Props {
  post: DiscussionPost;
  onDeleted?: () => void;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

export default function PostDetailPanel({ post, onDeleted, onCommentAdded, onCommentDeleted }: Props) {
  const router = useRouter();
  const t = useTranslations("discussion");
  const { user, isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ parentId: number; targetName: string } | null>(null);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const commentSectionRef = useRef<CommentSectionHandle>(null);

  const isOwner = user?.id === post.user_id;
  const isTakenDown = !!post.taken_down_at;
  const userProfileHref = post.user.slug ? `/discussion/user/${post.user.slug}` : `/discussion/user/${post.user_id}`;
  const [reportOpen, setReportOpen] = useState(false);
  const hasLongCaption = !!post.caption && (post.caption.length > 140 || post.caption.includes("\n"));

  // Listen to real-time post updates
  useEffect(() => {
    const handlePostUpdate = (event: CustomEvent<{
      slug: string;
      likesCount: number;
      commentsCount: number;
      userId?: number;
      action?: 'liked' | 'unliked';
    }>) => {
      if (event.detail.slug === post.slug) {
        setLikesCount(event.detail.likesCount);
        setCommentsCount(event.detail.commentsCount);
        
        // Update liked status if this is the current user's action
        if (event.detail.userId === user?.id && event.detail.action) {
          setLiked(event.detail.action === 'liked');
        }
      }
    };

    window.addEventListener("discussion-post-updated", handlePostUpdate as EventListener);
    return () => {
      window.removeEventListener("discussion-post-updated", handlePostUpdate as EventListener);
    };
  }, [post.slug, user?.id]);

  const getInitials = (name?: string | null) =>
    name
      ? name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (likeLoading) return;
    
    // Optimistic update
    const previousLiked = liked;
    const previousCount = likesCount;
    setLiked((prev) => !prev);
    setLikesCount((prev) => (previousLiked ? prev - 1 : prev + 1));
    setLikeLoading(true);
    
    try {
      await discussionLikeService.toggleLike(post.slug);
      // Don't update state here - let the broadcast event handle it
    } catch {
      // Rollback on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error(t("failedToggleLike"));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    await discussionPostService.deletePost(post.slug);
    toast.success(t("postDeleted"));
    onDeleted?.();
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    try {
      const payload: { content: string; parent_id?: number } = {
        content: newComment.trim(),
      };
      if (replyTo) {
        payload.parent_id = replyTo.parentId;
      }
      const res = await discussionCommentService.addComment(post.slug, payload);
      commentSectionRef.current?.addComment(res.data.data);
      setNewComment("");
      setReplyTo(null);
      const newCount = commentsCount + 1;
      setCommentsCount(newCount);
      onCommentAdded?.();
      toast.success(t("commentAdded"));
    } catch {
      toast.error(t("failedAddComment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setReportOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Author header — fixed */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-border/50 bg-linear-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          {isTakenDown && (
            <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-1.5 bg-destructive/10 text-destructive text-xs font-medium border-b border-destructive/20 z-10">
              <AlertTriangle className="h-3.5 w-3.5" />
              Postingan ini telah ditakedown oleh admin.
            </div>
          )}
          <Link
            href={userProfileHref}
            className="flex items-center gap-3 group"
          >
            <Avatar className="h-10 w-10 ring-2 ring-purple-200 dark:ring-purple-800 group-hover:ring-purple-400 transition-all shadow-sm">
              <AvatarImage
                src={post.user.profile?.avatar || undefined}
                alt={post.user.profile?.full_name}
              />
              <AvatarFallback className="bg-linear-to-br from-pink-500 to-purple-600 text-white text-xs font-bold">
                {getInitials(post.user.profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold leading-tight group-hover:text-purple-600 transition-colors">
                  {post.user.profile?.full_name ?? post.user.email}
                </p>
                {post.user.role === "admin" && (
                  <Badge className="text-[9px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold border-0">
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: idLocale,
                })}
              </p>
            </div>
          </Link>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="brand"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/discussion/${post.slug}/edit`)
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("editPost")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("deletePost")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Scrollable content — caption + comments */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
          {/* Caption */}
          {post.caption && (
            <div>
              <p
                className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap wrap-break-word",
                  !captionExpanded && "line-clamp-1",
                )}
              >
              <span className="font-semibold mr-1.5">
                {post.user.profile?.full_name ?? post.user.email}
              </span>
              {post.caption}
              </p>
              {hasLongCaption && (
                <button
                  type="button"
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                  onClick={() => setCaptionExpanded((prev) => !prev)}
                >
                  {captionExpanded ? t("seeLessCaption") : t("seeMoreCaption")}
                </button>
              )}
            </div>
          )}

          {/* Comments */}
          <div id="comments" className="border-t border-border/40 pt-3 scroll-mt-4">
            <CommentSection
              ref={commentSectionRef}
              postSlug={post.slug}
              postOwnerId={post.user_id}
              defaultOpen
              hideInput
              onCountChange={(delta) => {
                const newCount = commentsCount + delta;
                setCommentsCount(newCount);
                if (delta < 0) onCommentDeleted?.();
              }}
              onReply={(parentId, targetName) => {
                setReplyTo({ parentId, targetName });
                document.querySelector<HTMLTextAreaElement>("#comment-input")?.focus();
              }}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-border/50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-1 -mx-1">
            <Button
              variant="brand"
              size="sm"
              className={cn(
                "gap-1.5 rounded-xl px-3",
                liked
                  ? "text-pink-500 hover:text-pink-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <Heart className={cn("h-5 w-5", liked ? "fill-pink-500" : "")} />
              <span className="text-sm font-medium">{likesCount}</span>
            </Button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </div>

            {!isOwner && (
              <Button
                variant="brand"
                size="sm"
                className="gap-1.5 rounded-xl px-3 text-muted-foreground hover:text-orange-600"
                onClick={handleReportClick}
              >
                <Flag className="h-5 w-5" />
                <span className="text-sm font-medium">{t("report")}</span>
              </Button>
            )}
          </div>

          {/* Comment input */}
          <div className="space-y-1.5">
            {/* Reply-to indicator */}
            {replyTo && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/40">
                <p className="text-xs text-muted-foreground flex-1">
                  {t("replyingTo")}: <span className="font-semibold text-foreground">{replyTo.targetName}</span>
                </p>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            <div className="flex gap-2 items-end">
              <Textarea
                id="comment-input"
                rows={1}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAuthenticated 
                    ? replyTo 
                      ? t("replyTo", { name: replyTo.targetName })
                      : t("writeComment")
                    : t("loginToComment")
                }
              className="resize-none text-sm min-h-0 py-2 flex-1"
              onFocus={() => {
                if (!isAuthenticated) router.push("/login");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              loading={submitting}
              variant="submit"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
      <ReportPostDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        postSlug={post.slug}
      />
    </>
  );
}
