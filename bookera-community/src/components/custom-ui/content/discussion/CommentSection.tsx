"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Crown,
} from "lucide-react";
import { DiscussionComment } from "@/types/discussion";
import { discussionCommentService } from "@/services/discussion.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface CommentItemProps {
  comment: DiscussionComment;
  postSlug: string;
  postOwnerId: number;
  onDelete: (id: number) => void;
  onReply?: (parentId: number, targetName: string) => void;
}

function CommentItem({ comment, postSlug, postOwnerId, onDelete, onReply }: CommentItemProps) {
  const { user, isAuthenticated } = useAuthStore();
  const t = useTranslations("discussion");
  const router = useRouter();
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [replies, setReplies] = useState<DiscussionComment[]>(
    comment.replies ?? [],
  );
  const [loadingReplies, setLoadingReplies] = useState(false);

  const isCommentByPostOwner = comment.user_id === postOwnerId;
  const hasReplies = replies.length > 0 || !!comment.replies?.length;
  const totalReplies = replies.length || comment.replies?.length || 0;
  const remainingReplies = totalReplies - 1;
  
  // Show first reply by default if there are replies
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 1);

  const loadAllReplies = async () => {
    if (showAllReplies) {
      setShowAllReplies(false);
      return;
    }
    
    // If we already have all replies loaded, just show them
    if (replies.length > 1) {
      setShowAllReplies(true);
      return;
    }
    
    // Otherwise, fetch all replies
    setLoadingReplies(true);
    try {
      const res = await discussionCommentService.getReplies(comment.id);
      setReplies(res.data.data.data);
      setShowAllReplies(true);
    } catch {
      toast.error(t("failedLoadReplies"));
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleDeleteReply = async (id: number) => {
    try {
      await discussionCommentService.delete(id);
      setReplies((prev) => prev.filter((r) => r.id !== id));
      toast.success(t("replyDeleted"));
    } catch {
      toast.error(t("failedDeleteReply"));
    }
  };

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    onReply?.(comment.id, comment.user?.profile?.full_name || comment.user?.email || "User");
  };

  const getInitials = (name?: string | null) =>
    name
      ? name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";

  return (
    <>
      <div className="flex gap-3 group">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarImage
            src={comment.user?.profile?.avatar || undefined}
            alt={comment.user?.profile?.full_name}
          />
          <AvatarFallback className="text-xs bg-linear-to-br from-pink-400 to-purple-500 text-white">
            {getInitials(comment.user?.profile?.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold text-foreground">
                {comment.user?.profile?.full_name ?? comment.user?.email}
              </p>
              {isCommentByPostOwner && (
                <Badge className="text-[9px] px-1.5 py-0 h-4 bg-linear-to-r from-amber-400 to-orange-500 text-white font-semibold border-0 shadow-sm">
                  {t("creatorBadge")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap wrap-break-word">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1 ml-1">
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: idLocale,
              })}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-[11px] font-semibold text-muted-foreground hover:text-purple-600 hover:bg-transparent transition-colors"
              onClick={handleReplyClick}
            >
              {t("reply")}
            </Button>
            {user?.id === comment.user_id && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-auto w-auto p-0 text-muted-foreground hover:text-destructive hover:bg-transparent opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => onDelete(comment.id)}
                aria-label={t("deleteComment")}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Replies - always show first reply if exists */}
          {hasReplies && visibleReplies.length > 0 && (
            <div className="mt-2 space-y-2 pl-2 border-l-2 border-purple-100 dark:border-purple-900">
              {visibleReplies.map((reply) => {
                const isReplyByPostOwner = reply.user_id === postOwnerId;
                // Find parent comment to show nested reply indicator
                const isNestedReply = reply.parent_id !== comment.id;
                let parentUser: { name: string; isCreator: boolean } | null = null;
                
                if (isNestedReply) {
                  // Check if parent is the main comment
                  if (reply.parent_id === comment.id) {
                    parentUser = {
                      name: comment.user?.profile?.full_name ?? comment.user?.email ?? "User",
                      isCreator: isCommentByPostOwner
                    };
                  } else {
                    // Find parent in replies array
                    const parentReply = replies.find(r => r.id === reply.parent_id);
                    if (parentReply) {
                      parentUser = {
                        name: parentReply.user?.profile?.full_name ?? parentReply.user?.email ?? "User",
                        isCreator: parentReply.user_id === postOwnerId
                      };
                    }
                  }
                }
                
                return (
                  <div key={reply.id} className="flex gap-2 group/reply">
                    <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                      <AvatarImage
                        src={reply.user?.profile?.avatar || undefined}
                      />
                      <AvatarFallback className="text-[10px] bg-linear-to-br from-pink-300 to-purple-400 text-white">
                        {getInitials(reply.user?.profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[11px] font-semibold">
                            {reply.user?.profile?.full_name ?? reply.user?.email}
                          </span>
                          {isReplyByPostOwner && (
                            <Badge className="text-[8px] px-1 py-0 h-3.5 bg-linear-to-r from-amber-400 to-orange-500 text-white font-semibold border-0 shadow-sm">
                              {t("creatorBadge")}
                            </Badge>
                          )}
                          {parentUser && (
                            <>
                              <span className="text-[10px] text-muted-foreground mx-0.5">›</span>
                              <span className="text-[10px] text-muted-foreground">
                                {parentUser.name}
                              </span>
                              {parentUser.isCreator && (
                                <Badge className="text-[7px] px-0.5 py-0 h-3 bg-linear-to-r from-amber-400 to-orange-500 text-white font-semibold border-0 shadow-sm">
                                  <Crown className="h-1.5 w-1.5 mr-0.5" />
                                  {t("creatorBadge")}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap wrap-break-word">
                          {reply.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 ml-1">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-auto p-0 text-[10px] font-semibold text-muted-foreground hover:text-purple-600 hover:bg-transparent transition-colors"
                          onClick={() =>
                            onReply?.(
                              reply.id,
                              reply.user?.profile?.full_name ??
                                reply.user?.email ??
                                "User"
                            )
                          }
                        >
                          {t("reply")}
                        </Button>
                        {user?.id === reply.user_id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-auto w-auto p-0 text-muted-foreground hover:text-destructive hover:bg-transparent opacity-0 group-hover/reply:opacity-100 transition-all"
                            onClick={() => handleDeleteReply(reply.id)}
                            aria-label={t("deleteComment")}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* View more replies button */}
              {!showAllReplies && remainingReplies > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 ml-1 h-auto p-0 flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:bg-transparent"
                  onClick={loadAllReplies}
                  disabled={loadingReplies}
                >
                  {loadingReplies ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      {t("viewMoreReplies", { count: remainingReplies })}
                    </>
                  )}
                </Button>
              )}
              
              {/* Hide replies button */}
              {showAllReplies && totalReplies > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 ml-1 h-auto p-0 flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:bg-transparent"
                  onClick={() => setShowAllReplies(false)}
                >
                  <ChevronUp className="h-3 w-3" />
                  {t("hideReplies")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export interface CommentSectionHandle {
  addComment: (comment: DiscussionComment) => void;
}

interface CommentSectionProps {
  postSlug: string;
  postOwnerId: number;
  initialCommentsCount?: number;
  defaultOpen?: boolean;
  onCountChange?: (delta: number) => void;
  hideInput?: boolean;
  onReply?: (parentId: number, targetName: string) => void;
}

const CommentSection = forwardRef<CommentSectionHandle, CommentSectionProps>(
  function CommentSection({
    postSlug,
    postOwnerId,
    initialCommentsCount = 0,
    defaultOpen = false,
    onCountChange,
    hideInput = false,
    onReply,
  }: CommentSectionProps, ref) {
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations("discussion");
  const router = useRouter();
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const initialFetchDone = useRef(false);

  useImperativeHandle(ref, () => ({
    addComment: (comment: DiscussionComment) => {
      setComments((prev) => [comment, ...prev]);
      setLoaded(true);
      setOpen(true);
    },
  }));

  useEffect(() => {
    if (!defaultOpen || initialFetchDone.current) return;
    initialFetchDone.current = true;
    setOpen(true);
    setLoading(true);
    discussionCommentService
      .getAll(postSlug)
      .then((res) => {
        setComments(res.data.data.data);
        setLoaded(true);
      })
      .catch(() => toast.error(t("failedLoadComments")))
      .finally(() => setLoading(false));
  }, [defaultOpen, postSlug, t]);

  const loadComments = async () => {
    if (loaded) {
      setOpen((v) => !v);
      return;
    }
    setLoading(true);
    setOpen(true);
    try {
      const res = await discussionCommentService.getAll(postSlug, {});
      setComments(res.data.data.data);
      setLoaded(true);
    } catch {
      toast.error(t("failedLoadComments"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    try {
      const res = await discussionCommentService.create(postSlug, {
        content: newComment.trim(),
      });
      setComments((prev) => [res.data.data, ...prev]);
      setNewComment("");
      setLoaded(true);
      setOpen(true);
      onCountChange?.(1);
      toast.success(t("commentAdded"));
    } catch {
      toast.error(t("failedAddComment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await discussionCommentService.delete(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      onCountChange?.(-1);
      toast.success(t("commentDeleted"));
    } catch {
      toast.error(t("failedDeleteComment"));
    }
  };

  return (
    <>
      {!defaultOpen && (
        <Button
          type="button"
          onClick={loadComments}
          variant="ghost"
          className="h-auto p-0 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-purple-600 hover:bg-transparent transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{initialCommentsCount}</span>
        </Button>
      )}

      {(open || defaultOpen) && (
        <div className={defaultOpen ? "space-y-3" : "mt-3 border-t border-border/50 pt-3 space-y-3"}>
          {!hideInput && (
            <div className="flex gap-2">
              <Textarea
                rows={1}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAuthenticated ? t("writeComment") : t("loginToComment")
                }
                className="resize-none text-sm min-h-0 py-2 flex-1"
                onFocus={() => {
                  if (!isAuthenticated) router.push("/login");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim()}
                loading={submitting}
                variant="submit"
              >
                {t("send")}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-4">
              {t("noComments")}
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  postSlug={postSlug}
                  postOwnerId={postOwnerId}
                  onDelete={handleDelete}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
  },
);

export default CommentSection;
