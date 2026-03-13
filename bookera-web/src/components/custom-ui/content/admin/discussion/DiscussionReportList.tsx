"use client";

import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { DiscussionPostReport } from "@/types/discussion";
import { DiscussionReportCard } from "./DiscussionReportCard";

interface Props {
  reports: DiscussionPostReport[];
  actionLoading: number | null;
  onReview: (report: DiscussionPostReport) => void;
  onDismiss: (report: DiscussionPostReport) => void;
  onTakedown: (report: DiscussionPostReport) => void;
  onRestore: (postSlug: string) => void;
}

export function DiscussionReportList({
  reports,
  actionLoading,
  onReview,
  onDismiss,
  onTakedown,
  onRestore,
}: Props) {
  const t = useTranslations("discussion");

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
        <Flag className="h-10 w-10 opacity-30" />
        <p className="text-sm">{t("noReports")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <DiscussionReportCard
          key={report.id}
          report={report}
          actionLoading={actionLoading}
          onReview={() => onReview(report)}
          onDismiss={() => onDismiss(report)}
          onTakedown={() => onTakedown(report)}
          onRestore={() => onRestore(report.post?.slug ?? "")}
        />
      ))}
    </div>
  );
}
