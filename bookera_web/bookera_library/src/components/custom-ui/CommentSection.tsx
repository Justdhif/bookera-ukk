"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Reply,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  X,
  LogIn,
  Loader2,
} from "lucide-react";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";

import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";

interface GenericComment {
  id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  replies_count?: number;
  user?: {
    slug: string;
    email: string;
    role?: string;
    profile?: {
      full_name: string | null;
      avatar: string | null;
      gender?: string;
    };
  };
}

interface CommentItemProps {
  comment: GenericComment;
  entitySlug: string;
  currentUserId?: number;
  onReply: (commentId: number, name: string) => void;
  onDeleted: (commentId: number) => void;
  depth?: number;
  namespace: string;
  getReplies?: (commentId: number, params?: { page?: number; per_page?: number }) => Promise<any>;
  deleteComment?: (commentId: number) => Promise<any>;
}

function CommentItem({
  comment,
  entitySlug,
  currentUserId,
  onReply,
  onDeleted,
  depth = 0,
  namespace,
  getReplies,
  deleteComment,
}: CommentItemProps) {
  const t = useTranslations(namespace);
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? idLocale : enUS;

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<GenericComment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const [totalRepliesPages, setTotalRepliesPages] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const avatarUrl = comment.user?.profile?.avatar || "";
  const displayName =
    comment.user?.profile?.full_name ||
    comment.user?.email?.split("@")[0] ||
    "User";

  const fetchReplies = async (page = 1) => {
    if (!getReplies) return;
    setLoadingReplies(true);
    try {
      const res = await getReplies(comment.id, {
        page,
        per_page: 10,
      });
      const data = res.data.data;
      setReplies((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
      setTotalRepliesPages(data.last_page);
      setRepliesPage(page);
    } catch {
      toast.error(t("loadRepliesError", { defaultValue: "Failed to load replies" }));
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleToggleReplies = () => {
    if (
      !showReplies &&
      replies.length === 0 &&
      (comment.replies_count ?? 0) > 0
    ) {
      fetchReplies(1);
    }
    setShowReplies((v) => !v);
  };

  const handleDelete = async () => {
    if (!deleteComment) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
      toast.success(t("commentDeleted", { defaultValue: "Comment deleted" }));
    } catch {
      toast.error(t("commentDeleteError", { defaultValue: "Failed to delete comment" }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      className={
        depth > 0 ? "ml-9 border-l-2 border-brand-primary/15 pl-3" : ""
      }
    >
      <div className="flex gap-2.5 group">
        <Link
          href={`/${comment.user?.slug}/profile`}
          className="shrink-0 mt-0.5"
        >
          <Avatar className="h-7 w-7 border border-border hover:ring-2 hover:ring-brand-primary/30 transition-all">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-muted/40 dark:bg-muted/20 rounded-2xl rounded-tl-sm px-3 py-2 border border-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Link
                href={`/${comment.user?.slug}/profile`}
                className="text-xs font-bold hover:text-brand-primary transition-colors truncate max-w-[150px]"
              >
                {displayName}
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                {(comment.user?.role === "admin" ||
                  comment.user?.role?.startsWith("officer")) && <AdminBadge className="h-3.5 px-1 text-[7px]" />}
                {comment.user?.profile?.gender === "croissant" && <CroissantBadge className="h-3.5 px-1 text-[7px]" />}
              </div>
              <span className="text-[9px] text-muted-foreground/60 font-medium ml-auto shrink-0">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: dateLocale,
                })}
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1 px-1">
            {currentUserId && depth === 0 && (
              <button
                onClick={() => onReply(comment.id, displayName)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-primary font-medium transition-colors"
              >
                <Reply className="h-3 w-3" />
                {t("reply", { defaultValue: "Reply" })}
              </button>
            )}

            {(comment.replies_count ?? 0) > 0 && depth === 0 && getReplies && (
              <button
                onClick={handleToggleReplies}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-primary font-medium transition-colors"
              >
                {showReplies ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {showReplies
                  ? t("hideReplies", { defaultValue: "Hide replies" })
                  : t("showReplies", { count: comment.replies_count ?? 0, defaultValue: `Show ${comment.replies_count} replies` })}
              </button>
            )}

            {isOwner && deleteComment && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive font-medium transition-colors ml-auto opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
                {deleting ? t("deleting", { defaultValue: "Deleting..." }) : t("deleteComment", { defaultValue: "Delete" })}
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                {loadingReplies && replies.length === 0 ? (
                  <DataLoading size="sm" />
                ) : (
                  replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      entitySlug={entitySlug}
                      currentUserId={currentUserId}
                      onReply={onReply}
                      onDeleted={(id) =>
                        setReplies((prev) => prev.filter((r) => r.id !== id))
                      }
                      depth={depth + 1}
                      namespace={namespace}
                      getReplies={getReplies}
                      deleteComment={deleteComment}
                    />
                  ))
                )}
                {repliesPage < totalRepliesPages && (
                  <LoadMoreButton
                    onClick={() => fetchReplies(repliesPage + 1)}
                    loading={loadingReplies}
                    variant="ghost"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

interface CommentSectionProps {
  entitySlug: string;
  commentCount: number;
  onCommentCountChange?: (count: number) => void;
  namespace?: string;
  // Actions
  getComments: (slug: string, params?: { page?: number; per_page?: number }) => Promise<any>;
  createComment: (slug: string, data: { content: string; parent_id?: number }) => Promise<any>;
  getReplies?: (commentId: number, params?: { page?: number; per_page?: number }) => Promise<any>;
  deleteComment?: (commentId: number) => Promise<any>;
}

export default function CommentSection({
  entitySlug,
  commentCount,
  onCommentCountChange,
  namespace = "discussion",
  getComments,
  createComment,
  getReplies,
  deleteComment,
}: CommentSectionProps) {
  const t = useTranslations(namespace);
  const { user } = useAuthStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [comments, setComments] = useState<GenericComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [moderationAlert, setModerationAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchComments(1);
  }, [entitySlug]);

  const fetchComments = async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getComments(entitySlug, {
        page: pageNum,
        per_page: 15,
      });
      const data = res.data.data;
      setComments((prev) => (pageNum === 1 ? data.data : [...prev, ...data.data]));
      setTotalPages(data.last_page);
      setPage(pageNum);
    } catch {
      toast.error(t("loadCommentsError", { defaultValue: "Failed to load comments" }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;

    setSubmitting(true);
    try {
      const payload: { content: string; parent_id?: number } = {
        content: commentText.trim(),
      };
      if (replyTo) payload.parent_id = replyTo.id;

      const res = await createComment(entitySlug, payload);
      const newComment = res.data.data;

      if (!replyTo) {
        setComments((prev) => [newComment, ...prev]);
        onCommentCountChange?.(commentCount + 1);
      } else {
        toast.success(t("replySuccess", { defaultValue: "Reply sent" }));
      }

      setCommentText("");
      setReplyTo(null);
      setModerationAlert(null);
      toast.success(t("commentSuccess", { defaultValue: "Comment sent" }));
    } catch (error: any) {
      if (error.response?.status === 422) {
        setModerationAlert(error.response.data.message);
        toast.error(
          t("moderationAlertTitle", { defaultValue: "Inappropriate Content" }),
        );
      } else {
        toast.error(t("commentError", { defaultValue: "Failed to send comment" }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: number, name: string) => {
    setReplyTo({ id: commentId, name });
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCommentCountChange?.(Math.max(0, commentCount - 1));
  };

  return (
    <Card className="border-muted/60 bg-card/60 backdrop-blur-md overflow-hidden">
      <CardContent className="p-5 space-y-6">
        {/* Moderation Alert */}
        <AnimatePresence>
          {moderationAlert && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 4 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-red-500/10 border border-red-200/50 dark:border-red-800/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                    <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      {t("moderationAlertTitle", {
                        defaultValue: "Inappropriate Content",
                      })}
                    </p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5 leading-relaxed">
                      {moderationAlert}
                    </p>
                  </div>
                  <button
                    onClick={() => setModerationAlert(null)}
                    className="h-6 w-6 shrink-0 text-red-500/60 hover:text-red-600 transition-colors flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment Input Section */}
        <div className="space-y-3">
          {replyTo && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-primary/5 border border-brand-primary/20 text-sm">
              <Reply className="h-3.5 w-3.5 text-brand-primary shrink-0" />
              <span className="text-muted-foreground text-xs flex-1">
                {t("replyingTo", { defaultValue: "Replying to" })}{" "}
                <span className="font-semibold text-brand-primary">
                  {replyTo.name}
                </span>
              </span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {user ? (
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0 border border-border mt-1">
                <AvatarImage
                  src={user.profile?.avatar || ""}
                  alt="You"
                  className="object-cover"
                />
                <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs font-bold">
                  {(user.profile?.full_name || user.email)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      replyTo
                        ? t("replyPlaceholder", { name: replyTo.name, defaultValue: `Reply to ${replyTo.name}...` })
                        : t("commentPlaceholder", { defaultValue: "Write a comment..." })
                    }
                    className="min-h-[100px] rounded-2xl resize-none bg-background/50 focus:bg-background transition-all border-muted/60 focus:ring-brand-primary/20 text-sm p-4"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">
                    Ctrl+Enter {t("toSubmit", { defaultValue: "to submit" })}
                  </span>
                  <Button
                    size="sm"
                    variant="brand"
                    disabled={submitting || !commentText.trim()}
                    onClick={handleSubmitComment}
                    className="gap-2 px-4 h-9 text-xs rounded-xl font-semibold shadow-lg shadow-brand-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        {t("send", { defaultValue: "Send" })}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20 text-sm text-muted-foreground">
              <LogIn className="h-4 w-4 text-brand-primary shrink-0" />
              <span className="flex-1">{t("loginToComment", { defaultValue: "Log in to comment" })}</span>
              <Link href="/login">
                <Badge
                  variant="outline"
                  className="border-brand-primary/40 text-brand-primary hover:bg-brand-primary/5 cursor-pointer px-3 py-1"
                >
                  {t("loginBtn", { defaultValue: "Log In" })}
                </Badge>
              </Link>
            </div>
          )}
        </div>

        {/* Comments List Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80 px-1">
            <MessageCircle className="h-4 w-4 text-brand-primary" />
            {t("commentsTitle", { count: commentCount, defaultValue: `${commentCount} Comments` })}
          </h3>

          {loading ? (
            <div className="py-8">
              <DataLoading size="md" />
            </div>
          ) : comments.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="opacity-20" />}
              title={t("noComments", { defaultValue: "No comments yet" })}
              description={t("noCommentsDesc", { defaultValue: "Be the first to comment!" })}
              variant="compact"
            />
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    entitySlug={entitySlug}
                    currentUserId={user?.id}
                    onReply={handleReply}
                    onDeleted={handleDeleteComment}
                    namespace={namespace}
                    getReplies={getReplies}
                    deleteComment={deleteComment}
                  />
                ))}
              </AnimatePresence>

              {page < totalPages && (
                <div className="flex justify-center pt-2">
                  <LoadMoreButton
                    onClick={() => fetchComments(page + 1)}
                    loading={loadingMore}
                    variant="ghost"
                    className="text-xs font-medium text-brand-primary hover:bg-brand-primary/5"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
