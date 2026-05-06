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
import { Complaint } from "@/types/complaint";
import { useAuthStore } from "@/store/auth.store";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import PublicComplaintGrid from "../complaints/PublicComplaintGrid";
import CommentSection from "@/components/custom-ui/CommentSection";
import ImageCarousel from "@/components/custom-ui/ImageCarousel";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";
import { FadeUp, StaggerContainer } from "@/components/custom-ui/motion";

import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Reply,
  AlertTriangle,
  ThumbsUp,
  Clock,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Tag,
  Flag,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MemberBadge from "@/components/custom-ui/badge/MemberBadge";

export default function ComplaintDetailClient() {
  const t = useTranslations("complaint");
  const params = useParams();
  const slug = params.slug as string;
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? idLocale : enUS;

  const { user } = useAuthStore();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [votePending, setVotePending] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role?.startsWith("officer");
  const isMe = user?.id === complaint?.user?.id;

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
      toast.error(t("loginToSupport"));
      return;
    }
    if (votePending) return;
    setVotePending(true);
    try {
      const res = await complaintService.toggleVote(slug);
      setVoted(res.data.data.is_voted);
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
    <StaggerContainer className="space-y-8 pb-12">
      <FadeUp>
        <ContentHeader
          title={t("detailTitle")}
          description={t("detailDesc")}
          showBackButton
        />
      </FadeUp>

      <FadeUp delay={0.08}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8 lg:sticky lg:top-4">
            <Card className="overflow-hidden border-2 border-muted/50 bg-card/40 backdrop-blur-md shadow-xl rounded-3xl">
            <CardHeader className="p-8 pb-4 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-muted/30">
                <div className="flex items-center gap-3">
                  <Link href={isMe ? "/my-profile" : `/${complaint.user.slug}`}>
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
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        href={isMe ? "/my-profile" : `/${complaint.user.slug}`}
                        className="hover:text-brand-primary transition-colors"
                      >
                        <p className="text-sm font-black truncate leading-tight">
                          {complaint.user.profile?.full_name ||
                            complaint.user.email.split("@")[0]}
                        </p>
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        {complaint.user.role === "admin" && <AdminBadge />}
                        {complaint.user.role === "member" && <MemberBadge />}
                        {complaint.user.profile?.gender === "croissant" && <CroissantBadge />}
                      </div>
                    </div>
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
                    <Badge className="px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500 text-white border-0">
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

              <div className="pt-6 mt-6 border-t border-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-brand-primary/5 text-brand-primary">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black leading-none text-brand-primary">
                      {votesCount}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                      {t("votesLabel")}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleToggleVote}
                  disabled={votePending}
                  variant={voted ? "outline" : "brand"}
                  className={cn(
                    "h-11 rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 transition-all",
                    voted
                      ? "border-brand-primary/30 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10"
                      : "shadow-lg shadow-brand-primary/20",
                  )}
                >
                  {voted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t("votedBtn")}
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {t("voteBtn")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

          <div className="space-y-6 lg:sticky lg:top-4">
            <div className="space-y-6">
              <CommentSection
                entitySlug={slug}
                commentCount={complaint.comments_count}
                onCommentCountChange={(count) =>
                  setComplaint((prev) =>
                    prev ? { ...prev, comments_count: count } : prev,
                  )
                }
                namespace="complaint"
                getComments={complaintService.getComments}
                createComment={complaintService.createComment}
              />
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.16}>
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
      </FadeUp>
    </StaggerContainer>
  );
}
