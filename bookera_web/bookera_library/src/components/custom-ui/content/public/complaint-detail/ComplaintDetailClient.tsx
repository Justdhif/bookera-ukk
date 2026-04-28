"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { complaintService } from "@/services/complaint.service";
import { Complaint, ComplaintComment } from "@/types/complaint";
import { useAuthStore } from "@/store/auth.store";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import PublicComplaintGrid from "../PublicComplaintGrid";

import {
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
  ThumbsUp,
  Calendar,
  Clock,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Tag,
  Flag,
  ShieldCheck,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ------------------------------------------------------------------ */
/*  Image Carousel with Lightbox                                         */
/* ------------------------------------------------------------------ */
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
          className="relative w-full overflow-hidden rounded-2xl border border-muted/30 cursor-zoom-in shadow-md"
          style={{ aspectRatio: "16/9" }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={images[0].image_path}
            alt="complaint image"
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
        className="relative w-full overflow-hidden rounded-2xl border border-muted/30 group shadow-md"
        style={{ aspectRatio: "16/9" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].image_path}
            alt={`complaint image ${current + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
          />
        </AnimatePresence>

        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md tracking-widest">
          {current + 1} / {total}
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
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].image_path}
            alt={`Image ${current + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute -left-4 sm:left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              className="absolute -right-4 sm:right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="absolute top-0 right-0 p-4 flex items-center gap-4">
          <span className="text-white/60 text-xs font-bold tracking-widest">
            {current + 1} / {total}
          </span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all border border-white/10 backdrop-blur-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  depth = 0,
}: {
  comment: ComplaintComment;
  currentUserId?: number;
  onReply: (commentId: number, name: string) => void;
  depth?: number;
}) {
  const t = useTranslations("complaint");
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? idLocale : enUS;

  const [showReplies, setShowReplies] = useState(depth < 1);

  const avatarUrl = comment.user?.profile?.avatar || "";
  const displayName =
    comment.user?.profile?.full_name ||
    comment.user?.email?.split("@")[0] ||
    "User";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "relative",
        depth > 0 && "ml-10 mt-3 pt-3 border-t border-muted/30",
      )}
    >
      {depth > 0 && (
        <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-brand-primary/30 to-transparent" />
      )}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0 border-2 border-background shadow-sm mt-0.5">
          <AvatarImage
            src={avatarUrl}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-bold truncate">{displayName}</span>
            {(comment.user?.role === "admin" ||
              comment.user?.role?.startsWith("officer")) && (
              <Badge className="h-4 px-1 rounded-sm flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-tight bg-brand-primary text-brand-primary-foreground shrink-0 border-0">
                <ShieldCheck className="h-2.5 w-2.5" />
                Official
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </span>
          <div className="text-sm text-foreground/80 leading-relaxed bg-muted/30 rounded-2xl rounded-tl-none p-3 border border-muted/20">
            {comment.content}
          </div>

          <div className="flex items-center gap-4 px-1">
            {currentUserId && depth === 0 && (
              <button
                onClick={() => onReply(comment.id, displayName)}
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand-primary transition-colors flex items-center gap-1"
              >
                <Reply className="h-3 w-3" />
                {t("replyBtn", { fallback: "Balas" })}
              </button>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand-primary transition-colors flex items-center gap-1"
              >
                {showReplies ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {showReplies
                  ? "Sembunyikan"
                  : `${comment.replies.length} Balasan`}
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReplies && comment.replies && comment.replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    depth={depth + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                       */
/* ------------------------------------------------------------------ */
export default function ComplaintDetailClient() {
  const t = useTranslations("complaint");
  const params = useParams();
  const slug = params.slug as string;
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? idLocale : enUS;

  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role?.startsWith("officer");

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [votePending, setVotePending] = useState(false);

  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    complaintService
      .getBySlug(slug)
      .then((res) => {
        const data = res.data.data;
        setComplaint(data);
        setVoted(data.is_voted ?? false);
        setVotesCount(data.votes_count);
      })
      .catch(() => toast.error(t("errorFetchingDetail")))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComplaint = async () => {
    if (!slug) return;
    try {
      const res = await complaintService.getBySlug(slug);
      const data = res.data.data;
      setComplaint(data);
      setVoted(data.is_voted ?? false);
      setVotesCount(data.votes_count);
    } catch {
      toast.error(t("errorFetchingDetail"));
    }
  };

  const fetchComments = async () => {
    if (!slug) return;
    try {
      const res = await complaintService.getComments(slug);
      setComments(res.data.data.data);
    } catch {}
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!complaint || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await complaintService.updateStatus(complaint.slug, newStatus);
      toast.success(t("statusUpdated"));
      fetchComplaint();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("statusUpdateError"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleVote = async () => {
    if (!user) {
      toast.error("Silakan masuk untuk memberikan dukungan");
      return;
    }
    if (votePending) return;
    setVotePending(true);
    try {
      const res = await complaintService.toggleVote(slug);
      setVoted(res.data.data.is_voted);
      // Backend returns helpful_count or votes_count
      setVotesCount(
        res.data.data.helpful_count ?? (res.data.data as any).votes_count,
      );
      toast.success(
        res.data.data.is_voted ? t("voteSuccess") : t("unvoteSuccess"),
      );
    } catch {
      toast.error(t("voteError"));
    } finally {
      setVotePending(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast.error("Silakan masuk untuk menanggapi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await complaintService.createComment(slug, {
        content: commentText.trim(),
        parent_id: replyTo?.id,
      });
      const newComment = res.data.data;

      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c,
          ),
        );
      } else {
        setComments((prev) => [newComment, ...prev]);
      }

      setCommentText("");
      setReplyTo(null);
      setComplaint((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : null,
      );
      toast.success(t("commentSuccess"));
    } catch {
      toast.error(t("commentError"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "verified":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "on_progress":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3.5 w-3.5" />;
      case "verified":
        return <Info className="h-3.5 w-3.5" />;
      case "on_progress":
        return <AlertCircle className="h-3.5 w-3.5" />;
      case "resolved":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "rejected":
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  if (loading) return <DataLoading size="lg" />;
  if (!complaint)
    return (
      <EmptyState icon={<AlertTriangle />} title={t("errorFetchingDetail")} />
    );

  return (
    <div className="space-y-8 pb-12">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDesc")}
        showBackButton
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8 lg:sticky lg:top-4">
          <Card className="overflow-hidden border-2 border-muted/50 bg-card/40 backdrop-blur-md shadow-xl rounded-3xl">
            <CardHeader className="p-8 pb-4 space-y-6">
              {/* Reporter Info & Stats Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-muted/30">
                <div className="flex items-center gap-3">
                  <Link href={`/${complaint.user.slug}/profile`}>
                    <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                      <AvatarImage
                        src={complaint.user.profile?.avatar}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-brand-primary/5 text-brand-primary font-black">
                        {complaint.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/${complaint.user.slug}/profile`}
                      className="hover:text-brand-primary transition-colors"
                    >
                      <p className="text-sm font-black truncate leading-tight">
                        {complaint.user.profile?.full_name ||
                          complaint.user.email.split("@")[0]}
                      </p>
                    </Link>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                      {t(`role.${complaint.user.role}`, {
                        fallback: complaint.user.role,
                      })}{" "}
                      •{" "}
                      {formatDistanceToNow(new Date(complaint.created_at), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-muted-foreground self-end sm:self-auto">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-brand-primary/60" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {t("commentsCount", { count: complaint.comments_count })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-brand-primary/60" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {votesCount} Dukungan
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingStatus}
                          className={cn(
                            "h-auto px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border-2 flex items-center gap-1.5",
                            getStatusStyle(complaint.status),
                          )}
                        >
                          {getStatusIcon(complaint.status)}
                          {t(`status.${complaint.status}`)}
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 opacity-50",
                              updatingStatus && "animate-spin",
                            )}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="rounded-2xl p-1.5 border-2"
                      >
                        {[
                          "pending",
                          "verified",
                          "on_progress",
                          "resolved",
                          "rejected",
                        ].map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleUpdateStatus(s)}
                            className={cn(
                              "rounded-xl text-[10px] font-bold uppercase tracking-widest px-3 py-2 cursor-pointer mb-0.5 last:mb-0",
                              complaint.status === s
                                ? "bg-brand-primary/10 text-brand-primary"
                                : "hover:bg-muted",
                            )}
                          >
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full mr-2",
                                s === "pending" && "bg-amber-500",
                                s === "verified" && "bg-blue-500",
                                s === "on_progress" && "bg-indigo-500",
                                s === "resolved" && "bg-emerald-500",
                                s === "rejected" && "bg-rose-500",
                              )}
                            />
                            {t(`status.${s}`)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border-2",
                        getStatusStyle(complaint.status),
                      )}
                    >
                      {getStatusIcon(complaint.status)}
                      <span className="ml-1.5">
                        {t(`status.${complaint.status}`)}
                      </span>
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-muted/50 border-2 border-transparent"
                  >
                    <Tag className="h-3.5 w-3.5 mr-1.5 text-brand-primary" />
                    {t(`category.${complaint.category}`)}
                  </Badge>
                  {complaint.is_priority && (
                    <Badge className="px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500 text-white border-0 animate-pulse">
                      <Flag className="h-3.5 w-3.5 mr-1.5" />
                      {t("isPriority")}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl font-black tracking-tight leading-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {complaint.title}
                </h1>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-4 space-y-8">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-line font-medium">
                  {complaint.description}
                </p>
              </div>

              {complaint.images && complaint.images.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" />
                    {t("attachments")}
                  </h3>
                  <ImageCarousel images={complaint.images} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Vote/Helpful Card */}
          <Card className="border-2 border-muted/50 bg-brand-primary/5 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tight">
                  {t("supportTitle")}
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {t("supportDesc")}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-brand-primary">
                    {votesCount}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Dukungan
                  </span>
                </div>

                <Button
                  onClick={handleToggleVote}
                  disabled={votePending}
                  variant={voted ? "outline" : "brand"}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-lg",
                    voted
                      ? "border-brand-primary text-brand-primary bg-transparent"
                      : "shadow-brand-primary/20",
                  )}
                >
                  {voted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      {t("votedBtn")}
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="mr-2 h-5 w-5" />
                      {t("voteBtn")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-brand-primary" />
                {t("responsesTitle")}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  ({complaint.comments_count})
                </span>
              </h2>
            </div>

            <Card className="border-2 border-muted/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                {/* New Comment Input */}
                <div className="space-y-4">
                  {replyTo && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-primary/5 border border-brand-primary/20 text-xs">
                      <Reply className="h-3.5 w-3.5 text-brand-primary" />
                      <span className="text-muted-foreground font-medium">
                        Membalas{" "}
                        <span className="font-bold text-brand-primary">
                          {replyTo.name}
                        </span>
                      </span>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {user ? (
                    <div className="flex gap-4">
                      <Avatar className="h-9 w-9 shrink-0 border-2 border-background shadow-sm">
                        <AvatarImage
                          src={user.profile?.avatar}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold">
                          {user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          ref={textareaRef}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={t("writeResponsePlaceholder")}
                          className="min-h-[80px] text-sm resize-none border-2 focus-visible:ring-brand-primary/20 rounded-2xl p-4 bg-background/50"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSubmitComment}
                            disabled={submitting || !commentText.trim()}
                            className="rounded-2xl px-5 font-bold uppercase tracking-widest text-[10px] h-9"
                            variant="brand"
                          >
                            {submitting ? t("sending") : t("sendResponse")}
                            <Send className="ml-2 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-2">
                      <LogIn className="h-6 w-6 text-muted-foreground/40" />
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">
                          {t("loginToReview", {
                            fallback: "Masuk untuk Menanggapi",
                          })}
                        </p>
                      </div>
                      <Link href="/login">
                        <Button
                          variant="outline"
                          className="mt-1 h-8 rounded-xl text-[10px] font-bold uppercase tracking-widest px-4"
                        >
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-6 pt-6 border-t border-muted/30">
                  {commentsLoading ? (
                    <DataLoading size="sm" />
                  ) : comments.length === 0 ? (
                    <EmptyState
                      icon={<MessageCircle className="h-6 w-6" />}
                      title={t("noResponsesYet")}
                      description={t("responsesDesc")}
                      variant="compact"
                    />
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          currentUserId={user?.id}
                          onReply={(id, name) => {
                            setReplyTo({ id, name });
                            textareaRef.current?.focus();
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Explore More section */}
      <div className="pt-12 mt-8 border-t border-muted/30">
        <div className="mb-10">
          <h2 className="text-3xl font-black tracking-tight">
            {t("exploreOtherComplaints")}
          </h2>
          <p className="text-muted-foreground font-medium mt-2">
            {t("exploreOtherComplaintsDesc")}
          </p>
        </div>
        <PublicComplaintGrid />
      </div>
    </div>
  );
}
