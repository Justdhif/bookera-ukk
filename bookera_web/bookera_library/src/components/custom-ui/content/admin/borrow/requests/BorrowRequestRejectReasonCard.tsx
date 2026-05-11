"use client";

import { useTranslations } from "next-intl";
import { XCircle, AlertTriangle, MessageSquareWarning } from "lucide-react";
import { BorrowRequest } from "@/types/borrow-request";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";

interface BorrowRequestRejectReasonCardProps {
  request: BorrowRequest;
}

export default function BorrowRequestRejectReasonCard({
  request,
}: BorrowRequestRejectReasonCardProps) {
  const t = useTranslations("borrow-request");

  if (request.approval_status !== "rejected") {
    return null;
  }

  return (
    <Card className="relative overflow-hidden border-red-200/80 dark:border-red-900/50">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-red-500 via-rose-500 to-red-400" />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-base text-red-700 dark:text-red-300">
              {t("requestRejected")}
            </CardTitle>
            <CardDescription className="text-xs text-red-500/80 dark:text-red-400/70">
              {request.updated_at
                ? format(new Date(request.updated_at), "dd MMM yyyy, HH:mm")
                : "—"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-5">
        <div className="rounded-lg border border-red-200/60 bg-red-50/60 p-3.5 dark:border-red-900/40 dark:bg-red-950/30">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-600/80 dark:text-red-400/80">
            <MessageSquareWarning className="h-3.5 w-3.5" />
            {t("rejectReason")}
          </div>
          <p className="text-sm leading-relaxed text-red-700 dark:text-red-300">
            {request.reject_reason || (
              <span className="italic text-red-500/70 dark:text-red-400/50">
                {t("noRejectReason")}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-md bg-amber-50/60 p-2.5 dark:bg-amber-950/20">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t("rejectHint")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
