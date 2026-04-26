"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { BorrowRequest, BorrowRequestDetail } from "@/types/borrow-request";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";

interface BorrowRequestBooksCardProps {
  request: BorrowRequest;
  onApproveDetail: (detailId: number) => Promise<void>;
  onRejectDetail: (detail: BorrowRequestDetail) => void;
  loadingDetailId?: number | null;
  loadingAction?: "approve" | "reject" | null;
  disabled?: boolean;
}

export default function BorrowRequestBooksCard({
  request,
  onApproveDetail,
  onRejectDetail,
  loadingDetailId = null,
  loadingAction = null,
  disabled = false,
}: BorrowRequestBooksCardProps) {
  const t = useTranslations("borrow-request");
  const tCommon = useTranslations("common");

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t("requestedBooks")} ({request.borrow_request_details.length})
        </CardTitle>
        <CardDescription>{t("bookListHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {request.borrow_request_details.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              {t("noBooksInRequest")}
            </div>
          ) : (
            request.borrow_request_details.map((detail) => (
              <div
                key={detail.id}
                className="rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {detail.book?.cover_image ? (
                    <Image
                      src={detail.book.cover_image}
                      alt={detail.book.title}
                      className="h-20 w-14 rounded-lg object-cover shadow-sm"
                      width={300}
                      height={400}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-20 w-14 items-center justify-center rounded-lg bg-background/80 shadow-sm">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold leading-tight text-foreground">
                          {detail.book?.title || tCommon("noData")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {detail.book?.author || tCommon("noData")}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <BorrowStatusBadge status={detail.approval_status} />
                        {detail.book_copy?.copy_code && (
                          <Badge variant="secondary" className="font-mono text-[11px]">
                            {detail.book_copy.copy_code}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {detail.approval_status === "processing" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                          onClick={() => onRejectDetail(detail)}
                          disabled={disabled || loadingDetailId === detail.id}
                          loading={loadingDetailId === detail.id && loadingAction === "reject"}
                        >
                          {!(
                            loadingDetailId === detail.id && loadingAction === "reject"
                          ) && <XCircle className="h-4 w-4" />}
                          {t("reject")}
                        </Button>
                        <Button
                          variant="submit"
                          size="sm"
                          className="h-8 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600/20 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          onClick={() => onApproveDetail(detail.id)}
                          disabled={disabled || loadingDetailId === detail.id}
                          loading={loadingDetailId === detail.id && loadingAction === "approve"}
                        >
                          {!(
                            loadingDetailId === detail.id && loadingAction === "approve"
                          ) && <CheckCircle2 className="h-4 w-4" />}
                          {t("approve")}
                        </Button>
                      </div>
                    )}

                    {detail.approval_status === "rejected" && detail.reject_reason && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600/80">
                          {t("rejectReason")}
                        </p>
                        <p className="mt-1">{detail.reject_reason}</p>
                      </div>
                    )}

                    {detail.approval_status === "approved" && detail.book_copy && (
                      <div className="text-xs text-muted-foreground">
                        {detail.book_copy.copy_code && (
                          <span className="font-mono text-foreground">
                            {detail.book_copy.copy_code}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
