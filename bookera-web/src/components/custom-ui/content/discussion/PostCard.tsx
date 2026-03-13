"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Pencil, UserPlus, UserCheck, Shield, Flag, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DiscussionPost } from "@/types/discussion";
import { discussionLikeService, discussionPostService, userFollowerService } from "@/services/discussion.service";
import { useAuthStore } from "@/store/auth.store";
import PostImageCarousel from "./PostImageCarousel";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import ReportPostDialog from "./ReportPostDialog";
import { cn } from "@/lib/utils";

interface Props {
  post: DiscussionPost;
  onDeleted?: (postId: number) => void;
  feedMode?: boolean;
}


export default function PostCard({ post, onDeleted, feedMode = true }: Props) {
  const router = useRouter();
  const t = useTranslations("discussion");
  const { user, isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [likeLoading, setLikeLoading] = useState(false);
  const [following, setFollowing] = useState(!!post.user.is_following);
  const [followLoading, setFollowLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const isOwner = user?.id === post.user_id;
  const avatarSrc = post.user.profile?.avatar_url || post.user.profile?.avatar || undefined;
  const isTakenDown = !!post.taken_down_at;
  const userProfileHref = post.user.slug ? `/discussion/user/${post.user.slug}` : `/discussion/user/${post.user_id}`;
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
      ? name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
      : "?";

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error(t("loginToLike"));
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
    setDeleting(true);
    try {
      await discussionPostService.deletePost(post.slug);
      toast.success(t("postDeleted"));
      onDeleted?.(post.id);
    } catch {
      toast.error(t("failedDeletePost"));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleCommentClick = () => {
    // Navigate to post detail page
    router.push(`/discussion/${post.slug}`);
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(t("loginToLike"));
      router.push("/login");
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (following) {
        await userFollowerService.unfollow(post.user_id);
        setFollowing(false);
      } else {
        await userFollowerService.follow(post.user_id);
        setFollowing(true);
      }
    } catch {
      toast.error(following ? t("failedUnfollow") : t("failedFollow"));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleReportClick = async () => {
    if (!isAuthenticated) {
      toast.error(t("loginToLike"));
      router.push("/login");
      return;
    }
    setReportOpen(true);
  };

  return (
    <>
      <article className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {isTakenDown && (
          <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t("takenDown")}
          </div>
        )}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <Link href={userProfileHref} className="flex items-center gap-3 group">
            <Avatar className="h-10 w-10 ring-2 ring-border group-hover:ring-purple-400 transition-all">
              <AvatarImage src={avatarSrc} alt={post.user.profile?.full_name} />
              <AvatarFallback className="bg-linear-to-br from-pink-500 to-purple-600 text-white text-xs font-bold">
                {getInitials(post.user.profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold leading-tight group-hover:text-purple-600 transition-colors">
                  {post.user.profile?.full_name ?? post.user.email}
                </p>
                {post.user.role === "admin" && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold border-0">
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    {t("adminBadge")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: idLocale,
                })}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {!isOwner && (
              <Button
                size="sm"
                variant="brand"
                className={cn(
                  "h-7 text-xs px-2.5 rounded-full",
                  following
                    ? "border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    : "text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                )}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {following ? (
                  <><UserCheck className="h-3.5 w-3.5 mr-1" />{t("following")}</>
                ) : (
                  <><UserPlus className="h-3.5 w-3.5 mr-1" />{t("follow")}</>
                )}
              </Button>
            )}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="brand" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/discussion/${post.slug}/edit`)}>
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
        </div>

        {post.images.length > 0 && (
          <Link href={`/discussion/${post.slug}`}>
            <PostImageCarousel images={post.images} />
          </Link>
        )}

        <div className="flex items-center gap-1 px-3 py-3">
          <Button
            variant="brand"
            size="sm"
            className={cn(
              "gap-1.5 rounded-xl px-3",
              liked ? "text-pink-500 hover:text-pink-600" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleLike}
            disabled={likeLoading}
          >
            <Heart className={cn("h-5 w-5", liked ? "fill-pink-500" : "")} />
            <span className="text-sm font-medium">{likesCount}</span>
          </Button>

          <Button
            variant="brand"
            size="sm"
            className="gap-1.5 rounded-xl px-3 text-muted-foreground hover:text-foreground"
            onClick={handleCommentClick}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </Button>

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

        {post.caption && (
          <div className="px-4 pb-3">
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
      </article>

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
