"use client";

import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  RotateCcw, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DiscussionPostReport, PostReportStatus } from "@/types/discussion";

export const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  misinformation: "Misinformation",
  inappropriate_content: "Inappropriate Content",
  other: "Other",
};

function StatusBadge({ status }: { status: PostReportStatus }) {
  const t = useTranslations("discussion");
  switch (status) {
    case "pending":
      return (
        <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-xs">
          <Clock className="h-3 w-3" />
          {t("statusPending")}
        </Badge>
      );
    case "reviewed":
      return (
        <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">
          <CheckCircle className="h-3 w-3" />
          {t("statusReviewed")}
        </Badge>
      );
    case "dismissed":
      return (
        <Badge className="gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0 text-xs">
          <XCircle className="h-3 w-3" />
          {t("statusDismissed")}
        </Badge>
      );
  }
}

interface Props {
  report: DiscussionPostReport;
  actionLoading: number | null;
  onReview: () => void;
  onDismiss: () => void;
  onTakedown: () => void;
  onRestore: () => void;
}

export function DiscussionReportCard({
  report,
  actionLoading,
  onReview,
  onDismiss,
  onTakedown,
  onRestore,
}: Props) {
  const t = useTranslations("discussion");

  const post = report.post;
  const reporter = report.reporter;
  const reporterName = reporter?.profile?.full_name ?? reporter?.email ?? "Unknown";
  const postAuthorName = post?.user?.profile?.full_name ?? post?.user?.email ?? "Unknown";
  const isTakenDown = !!post?.taken_down_at;
  const isLoading = actionLoading === report.id;

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Post preview */}
      <div className={`px-4 pt-3 pb-2 border-b border-border/40 ${isTakenDown ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            {isTakenDown && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium">
                <AlertTriangle className="h-3 w-3" />
                {t("takenDown")}
              </div>
            )}
            <p className="text-sm line-clamp-2 text-foreground">
              {post?.caption ?? (
                <span className="text-muted-foreground italic">[No caption]</span>
              )}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>by</span>
              <Link
                href={`/discussion/user/${post?.user?.slug ?? post?.user_id}`}
                className="hover:underline font-medium"
                target="_blank"
              >
                {postAuthorName}
              </Link>
              <span>·</span>
              <Link
                href={`/discussion/post/${post?.slug}`}
                className="hover:underline flex items-center gap-0.5"
                target="_blank"
              >
                {t("viewPost")}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Report details */}
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Avatar className="h-5 w-5">
              <AvatarImage src={reporter?.profile?.avatar_url ?? undefined} alt={reporterName} />
              <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-slate-700">
                {reporterName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{reporterName}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {REASON_LABELS[report.reason] ?? report.reason}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(report.created_at), {
                addSuffix: true,
                locale: idLocale,
              })}
            </span>
          </div>
          {report.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 ml-7">
              &ldquo;{report.description}&rdquo;
            </p>
          )}
          {report.admin_note && (
            <p className="text-xs text-purple-600 dark:text-purple-400 line-clamp-1 ml-7">
              Note: {report.admin_note}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {report.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 gap-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                onClick={onReview}
                disabled={isLoading}
              >
                              <Eye className="w-4 h-4 mr-2" /> <CheckCircle className="h-3 w-3" />{t("review")}
                          </Button>
              <Button
                size="sm"
                variant="brand"
                className="text-xs h-7 gap-1"
                onClick={onDismiss}
                disabled={isLoading}
              >
                <XCircle className="h-3 w-3" />
                {t("dismiss")}
              </Button>
            </>
          )}

          {!isTakenDown && (
            <Button
              size="sm"
              variant="brand"
              className="text-xs h-7 gap-1"
              onClick={onTakedown}
              disabled={isLoading}
            >
              <AlertTriangle className="h-3 w-3" />
              {t("takedown")}
            </Button>
          )}

          {isTakenDown && (
            <Button
              size="sm"
              variant="brand"
              className="text-xs h-7 gap-1 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
              onClick={onRestore}
              disabled={isLoading}
            >
              <RotateCcw className="h-3 w-3" />
              {t("restore")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
