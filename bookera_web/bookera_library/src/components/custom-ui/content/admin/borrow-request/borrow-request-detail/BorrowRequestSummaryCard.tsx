"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { CalendarClock, Layers3 } from "lucide-react";
import { BorrowRequest } from "@/types/borrow-request";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";

interface BorrowRequestSummaryCardProps {
  request: BorrowRequest;
}

export default function BorrowRequestSummaryCard({
  request,
}: BorrowRequestSummaryCardProps) {
  const t = useTranslations("borrow-request");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          {t("requestSummary")}
        </CardTitle>
        <CardDescription>{t("requestInfoDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("statusOverview")}</p>
            <BorrowStatusBadge
              status={request.approval_status}
              className="h-8 px-3 text-xs font-semibold"
            />
          </div>
          <div className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            #{request.id}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Layers3 className="h-4 w-4" />
            {t("requestTimeline")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="text-xs text-muted-foreground">{t("bookCount")}</p>
              <p className="mt-1 text-2xl font-semibold">
                {request.borrow_request_details.length}
              </p>
            </div>
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="text-xs text-muted-foreground">{t("submittedAt")}</p>
              <p className="mt-1 text-sm font-medium">
                {format(new Date(request.created_at), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="text-xs text-muted-foreground">{t("updatedAt")}</p>
              <p className="mt-1 text-sm font-medium">
                {format(new Date(request.updated_at), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
