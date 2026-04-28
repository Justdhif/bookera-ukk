"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { discussionService } from "@/services/discussion.service";
import { DiscussionPost, DiscussionComment } from "@/types/discussion";
import { useAuthStore } from "@/store/auth.store";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import PublicDiscussionGrid from "../PublicDiscussionGrid";

import {
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Reply,
  Trash2,
  AlertTriangle,
  LogIn,
  X,
  ShieldAlert,
} from "lucide-react";

function ImageCarousel({
  images,
}: {
  images: { id: number; image_path: string }[];
}) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const total = images.length;

  if (total === 0) return null;
  if (total === 1) {
    return (
      <>
        <div
          className="relative w-full overflow-hidden rounded-xl border border-muted/30 cursor-zoom-in"
          style={{ aspectRatio: "16/9" }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={images[0].image_path}
            alt="image 1"
            className="w-full h-full object-cover"
          />
        </div>
        {lightbox && (
          <LightboxModal
            images={images}
            index={0}
            onClose={() => setLightbox(false)}
          />
        )}
      </>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-muted/30 group"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Slides */}
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].image_path}
            alt={`image ${current + 1}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
          />
        </AnimatePresence>

        {/* Prev button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Next button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Counter badge */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {current + 1} / {total}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <LightboxModal
          images={images}
          index={current}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}

function LightboxModal({
  images,
  index,
  onClose,
}: {
  images: { id: number; image_path: string }[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const total = images.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].image_path}
            alt={`Image ${current + 1}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="max-h-[82vh] max-w-full object-contain rounded-xl"
          />
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="flex gap-2 mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === current
                      ? "w-5 h-2 bg-white"
                      : "w-2 h-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-2 right-2 flex items-center gap-2">
          <span className="text-white/60 text-xs">
            {current + 1} / {total}
          </span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  postSlug,
  currentUserId,
  onReply,
  onDeleted,
  depth = 0,
}: {
  comment: DiscussionComment;
  postSlug: string;
  currentUserId?: number;
  onReply: (commentId: number, name: string) => void;
  onDeleted: (commentId: number) => void;
  depth?: number;
}) {
  const t = useTranslations("discussion");
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? idLocale : enUS;

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<DiscussionComment[]>([]);
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
    setLoadingReplies(true);
    try {
      const res = await discussionService.getReplies(comment.id, {
        page,
        per_page: 10,
      });
      const data = res.data.data;
      setReplies((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
      setTotalRepliesPages(data.last_page);
      setRepliesPage(page);
    } catch {
      toast.error(t("loadRepliesError"));
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
    setDeleting(true);
    try {
      await discussionService.deleteComment(comment.id);
      onDeleted(comment.id);
      toast.success(t("commentDeleted"));
    } catch {
      toast.error(t("commentDeleteError"));
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
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <Link
                href={`/${comment.user?.slug}/profile`}
                className="text-xs font-semibold hover:text-brand-primary transition-colors truncate"
              >
                {displayName}
              </Link>
              <span className="text-[10px] text-muted-foreground shrink-0">
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
                {t("reply")}
              </button>
            )}

            {(comment.replies_count ?? 0) > 0 && depth === 0 && (
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
                  ? t("hideReplies")
                  : t("showReplies", { count: comment.replies_count ?? 0 })}
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive font-medium transition-colors ml-auto opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
                {deleting ? t("deleting") : t("deleteComment")}
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
                      postSlug={postSlug}
                      currentUserId={currentUserId}
                      onReply={onReply}
                      onDeleted={(id) =>
                        setReplies((prev) => prev.filter((r) => r.id !== id))
                      }
                      depth={depth + 1}
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

export default function DiscussionDetailClient() {
  const t = useTranslations("discussion");
  const params = useParams();
  const slug = params.slug as string;
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? idLocale : enUS;

  const { user } = useAuthStore();

  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likePending, setLikePending] = useState(false);

  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsPage, setCommentsPage] = useState(1);
  const [totalCommentsPages, setTotalCommentsPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [moderationAlert, setModerationAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    discussionService
      .getBySlug(slug)
      .then((res) => {
        const data = res.data.data;
        setPost(data);
        setLiked(data.is_liked ?? false);
        setLikesCount(data.likes_count);
      })
      .catch(() => toast.error(t("loadError")))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    fetchComments(1);
  }, [slug]);

  const fetchComments = async (page: number) => {
    if (page === 1) setCommentsLoading(true);
    else setLoadingMore(true);
    try {
      const res = await discussionService.getComments(slug, {
        page,
        per_page: 15,
      });
      const data = res.data.data;
      setComments((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
      setTotalCommentsPages(data.last_page);
      setCommentsPage(page);
    } catch {
      toast.error(t("loadCommentsError"));
    } finally {
      setCommentsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error(t("loginToLike"));
      return;
    }
    if (likePending) return;
    setLikePending(true);
    try {
      const res = await discussionService.toggleLike(slug);
      setLiked(res.data.data.liked);
      setLikesCount(res.data.data.likes_count);
    } catch {
      toast.error(t("likeError"));
    } finally {
      setLikePending(false);
    }
  };

  const handleReply = (commentId: number, name: string) => {
    setReplyTo({ id: commentId, name });
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast.error(t("loginToComment"));
      return;
    }
    setSubmitting(true);
    try {
      const payload: { content: string; parent_id?: number } = {
        content: commentText.trim(),
      };
      if (replyTo) payload.parent_id = replyTo.id;

      const res = await discussionService.createComment(slug, payload);
      const newComment = res.data.data;

      if (!replyTo) {
        setComments((prev) => [newComment, ...prev]);
        setPost((prev) =>
          prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev,
        );
      }
      setCommentText("");
      setReplyTo(null);
      setModerationAlert(null);
      toast.success(t("commentSuccess"));
    } catch (error: any) {
      if (error.response?.status === 422) {
        setModerationAlert(error.response.data.message);
        toast.error(
          t("moderationAlertTitle", { defaultValue: "Konten Tidak Pantas" }),
        );
      } else {
        toast.error(t("commentError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPost((prev) =>
      prev
        ? { ...prev, comments_count: Math.max(0, prev.comments_count - 1) }
        : prev,
    );
  };

  const images = post?.images ?? [];
  const profile = post?.user?.profile;
  const avatarUrl = profile?.avatar || "";
  const displayName =
    profile?.full_name || post?.user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDesc")}
        showBackButton
        isAdmin={false}
      />

      {loading ? (
        <DataLoading size="lg" />
      ) : !post ? (
        <EmptyState
          icon={<AlertTriangle />}
          title={t("notFound")}
          description={t("notFoundDesc")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-5 order-2 lg:order-2 space-y-4">
              <AnimatePresence>
                {moderationAlert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
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
                              defaultValue: "Pesan Tidak Dapat Dikirim",
                            })}
                          </p>
                          <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5 leading-relaxed">
                            {moderationAlert}
                          </p>
                        </div>
                        <button
                          onClick={() => setModerationAlert(null)}
                          className="h-6 w-6 shrink-0 text-red-500/60 hover:text-red-600 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comment form */}
              <Card className="border-muted/60 bg-card/60 backdrop-blur-md">
                <CardContent className="p-4 space-y-3">
                  {replyTo && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/5 border border-brand-primary/20 text-sm">
                      <Reply className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                      <span className="text-muted-foreground text-xs">
                        {t("replyingTo")}{" "}
                        <span className="font-semibold text-brand-primary">
                          {replyTo.name}
                        </span>
                      </span>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="ml-auto text-muted-foreground hover:text-foreground text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {user ? (
                    <div className="flex gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0 border border-border mt-0.5">
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
                      <div className="flex-1 space-y-2">
                        <Textarea
                          ref={textareaRef}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={
                            replyTo
                              ? t("replyPlaceholder", { name: replyTo.name })
                              : t("commentPlaceholder")
                          }
                          className="min-h-[72px] resize-none bg-background/70 focus:bg-background transition-colors text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleSubmitComment();
                            }
                          }}
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-muted-foreground">
                            Ctrl+Enter {t("toSubmit")}
                          </span>
                          <Button
                            size="sm"
                            variant="brand"
                            disabled={submitting || !commentText.trim()}
                            onClick={handleSubmitComment}
                            className="gap-1.5 h-8 text-xs"
                          >
                            <Send className="h-3 w-3" />
                            {submitting ? t("sending") : t("send")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground">
                      <LogIn className="h-4 w-4 text-brand-primary shrink-0" />
                      <span className="text-sm">{t("loginToComment")}</span>
                      <Link href="/login">
                        <Badge
                          variant="outline"
                          className="border-brand-primary/40 text-brand-primary hover:bg-brand-primary/5 cursor-pointer text-xs"
                        >
                          {t("loginBtn")}
                        </Badge>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments list */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground px-0.5">
                  <MessageCircle className="h-3.5 w-3.5 text-brand-primary" />
                  {t("commentsTitle", { count: post.comments_count })}
                </h3>

                {commentsLoading ? (
                  <DataLoading size="md" />
                ) : comments.length === 0 ? (
                  <EmptyState
                    icon={<MessageCircle />}
                    title={t("noComments")}
                    description={t("noCommentsDesc")}
                    variant="compact"
                  />
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          postSlug={slug}
                          currentUserId={user?.id}
                          onReply={handleReply}
                          onDeleted={handleDeleteComment}
                        />
                      ))}
                    </AnimatePresence>

                    {commentsPage < totalCommentsPages && (
                      <div className="flex justify-center pt-1">
                        <LoadMoreButton
                          onClick={() => fetchComments(commentsPage + 1)}
                          loading={loadingMore}
                          variant="outline"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Left side: Post card */}
            <div className="lg:col-span-7 order-1 lg:order-1 space-y-4 lg:sticky lg:top-4 h-fit">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-muted/60 bg-card/60 backdrop-blur-md">
                  <CardContent className="p-5 space-y-4">
                    {/* Author row */}
                    <div className="flex items-center gap-3">
                      <Link href={`/${post.user?.slug}/profile`}>
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm hover:border-brand-primary/40 transition-colors">
                          <AvatarImage
                            src={avatarUrl}
                            alt={displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/${post.user?.slug}/profile`}
                          className="text-sm font-bold hover:text-brand-primary transition-colors truncate"
                        >
                          {displayName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground">
                          @{post.user?.email?.split("@")[0]} ·{" "}
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Caption */}
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {post.caption}
                    </p>

                    {/* Image Carousel */}
                    {images.length > 0 && <ImageCarousel images={images} />}

                    {/* Actions */}
                    <div className="flex items-center gap-5 pt-1 border-t border-muted/50">
                      <button
                        onClick={handleToggleLike}
                        disabled={likePending}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
                          liked
                            ? "text-rose-500"
                            : "text-muted-foreground hover:text-rose-500"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 transition-all duration-200 ${liked ? "fill-rose-500 scale-110" : ""}`}
                        />
                        <span>{likesCount}</span>
                        <span className="hidden sm:inline text-xs">
                          {t("likes")}
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                        <span className="hidden sm:inline text-xs">
                          {t("comments")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          <PublicDiscussionGrid />
        </>
      )}
    </div>
  );
}
