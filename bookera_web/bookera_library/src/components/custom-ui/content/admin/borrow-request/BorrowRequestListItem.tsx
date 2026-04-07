"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { BookOpen, Calendar, Eye, Trash, User } from "lucide-react";
import { BorrowRequest } from "@/types/borrow-request";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";

interface BorrowRequestListItemProps {
  request: BorrowRequest;
  onDelete: (id: number) => void;
  onOpenDetail: (id: number) => void;
}

export default function BorrowRequestListItem({
  request,
  onDelete,
  onOpenDetail,
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
                  {request.user?.profile?.full_name || request.user?.email || "-"}
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
            <Button
              size="icon-sm"
              variant="destructive"
              onClick={() => onDelete(request.id)}
              aria-label={t("delete")}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 px-3"
              onClick={() => onOpenDetail(request.id)}
            >
              <Eye className="h-3.5 w-3.5" />
              {t("detail")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
