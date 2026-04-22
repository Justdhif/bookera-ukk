"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { BookOpen, Calendar, Eye, User, ArrowRight } from "lucide-react";
import { BorrowRequest } from "@/types/borrow-request";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";

interface BorrowRequestListItemProps {
  request: BorrowRequest;
}

export default function BorrowRequestListItem({
  request,
}: BorrowRequestListItemProps) {
  const t = useTranslations("borrow-request");

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <BorrowStatusBadge
                status={request.approval_status}
                className="h-7 px-2.5 text-xs font-medium"
              />
              <div className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {request.user?.profile?.full_name ||
                    request.user?.email ||
                    "-"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {t("borrowLabel")}
                  {format(new Date(request.borrow_date), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {t("returnLabel")}
                  {format(new Date(request.return_date), "dd MMM yyyy")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-sm">
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2 text-muted-foreground">
                {request.borrow_request_details
                  ?.map((detail) => detail.book?.title)
                  .filter(Boolean)
                  .join(", ") || "-"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link href={`/admin/borrow-requests/${request.id}`}>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("detail")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
