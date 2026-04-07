"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { BorrowRequest } from "@/types/borrow-request";
import { Card, CardContent } from "@/components/ui/card";

interface BorrowRequestRejectReasonCardProps {
  request: BorrowRequest;
}

export default function BorrowRequestRejectReasonCard({
  request,
}: BorrowRequestRejectReasonCardProps) {
  const t = useTranslations("borrow-request");

  if (request.approval_status !== "rejected" || !request.reject_reason) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {t("rejectReason")}
          </p>
          <p className="mt-0.5 text-sm text-red-600 dark:text-red-200">
            {request.reject_reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
