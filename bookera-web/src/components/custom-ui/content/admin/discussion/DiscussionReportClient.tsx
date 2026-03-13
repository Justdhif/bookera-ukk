"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { adminDiscussionService } from "@/services/discussion.service";
import { DiscussionPostReport, PostReportStatus } from "@/types/discussion";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { DiscussionReportSkeleton } from "./DiscussionReportSkeleton";
import { DiscussionReportFilter } from "./DiscussionReportFilter";
import { DiscussionReportList } from "./DiscussionReportList";
import { DiscussionReviewDialog, ReviewDialogState } from "./DiscussionReviewDialog";

export default function DiscussionReportClient() {
  const t = useTranslations("discussion");
  const [reports, setReports] = useState<DiscussionPostReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<PostReportStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState | null>(null);

  const fetchReports = useCallback(
    async (currentPage: number, status: PostReportStatus | "all") => {
      setLoading(true);
      try {
        const res = await adminDiscussionService.getReports({
          page: currentPage,
          per_page: 15,
          status: status === "all" ? undefined : status,
        });
        const data = res.data.data;
        setReports(data.data ?? []);
        setPagination({
          current_page: data.current_page ?? 1,
          last_page: data.last_page ?? 1,
          total: data.total ?? 0,
          from: data.from ?? 0,
          to: data.to ?? 0,
        });
      } catch {
        toast.error(t("failedLoadPosts"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchReports(page, statusFilter);
  }, [page, statusFilter, fetchReports]);

  const handleStatusFilterChange = (value: PostReportStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  };

  const openReviewDialog = (report: DiscussionPostReport, action: ReviewDialogState["action"]) => {
    setReviewDialog({ report, action });
  };

  const handleConfirmAction = async (data: {
    reviewStatus: "reviewed" | "dismissed";
    adminNote?: string;
    takedownReason?: string;
  }) => {
    if (!reviewDialog) return;
    const { report, action } = reviewDialog;
    setActionLoading(report.id);
    try {
      if (action === "takedown") {
        await adminDiscussionService.takedownPost(report.post!.slug, {
          reason: data.takedownReason,
        });
        toast.success(t("takedownSuccess"));
      } else {
        await adminDiscussionService.reviewReport(report.id, {
          status: data.reviewStatus,
          admin_note: data.adminNote,
        });
        toast.success(
          data.reviewStatus === "reviewed" ? t("reportReviewed") : t("reportDismissed"),
        );
      }
      setReviewDialog(null);
      fetchReports(page, statusFilter);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t("failedAction"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestorePost = async (postSlug: string) => {
    try {
      await adminDiscussionService.restorePost(postSlug);
      toast.success(t("restoreSuccess"));
      fetchReports(page, statusFilter);
    } catch {
      toast.error(t("failedAction"));
    }
  };

  if (loading && reports.length === 0) {
    return <DiscussionReportSkeleton />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            {t("discussionReportsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("discussionReportsDesc")}
          </p>
        </div>
        <DiscussionReportFilter value={statusFilter} onChange={handleStatusFilterChange} />
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          {pagination.total} {t("reportsTotal")}
        </p>
      )}

      <PaginatedContent
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={(p) => setPage(p)}
      >
        {loading ? (
          <DiscussionReportSkeleton />
        ) : (
          <DiscussionReportList
            reports={reports}
            actionLoading={actionLoading}
            onReview={(report) => openReviewDialog(report, "review")}
            onDismiss={(report) => openReviewDialog(report, "dismiss")}
            onTakedown={(report) => openReviewDialog(report, "takedown")}
            onRestore={handleRestorePost}
          />
        )}
      </PaginatedContent>

      <DiscussionReviewDialog
        state={reviewDialog}
        loading={actionLoading !== null}
        onClose={() => setReviewDialog(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
