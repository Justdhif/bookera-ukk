"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Calendar, User } from "lucide-react";
import { BorrowRequest } from "@/types/borrow-request";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BorrowRequestInfoCardProps {
  request: BorrowRequest;
}

export default function BorrowRequestInfoCard({
  request,
}: BorrowRequestInfoCardProps) {
  const t = useTranslations("borrow-request");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("borrowerInformation")}
        </CardTitle>
        <CardDescription>{t("requestInfoDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
          <p className="font-medium">
            {request.user?.profile?.full_name || "-"}
          </p>
          <p className="text-sm text-muted-foreground">{request.user?.email}</p>
        </div>

        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" />
            {t("dates")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">{t("borrowDate")}</p>
              <p className="mt-1 font-medium">
                {format(new Date(request.borrow_date), "dd MMMM yyyy")}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">{t("returnDate")}</p>
              <p className="mt-1 font-medium">
                {format(new Date(request.return_date), "dd MMMM yyyy")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
