"use client";

import { Borrow } from "@/types/borrow";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, DollarSign, RotateCcw, User } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface BorrowInfoCardProps {
  borrow: Borrow;
}

export function BorrowInfoCard({ borrow }: BorrowInfoCardProps) {
  const t = useTranslations("borrow");
  const tRequest = useTranslations("borrow-request");
  const tCommon = useTranslations("common");
  const returnRecords = [...(borrow.book_returns ?? [])].sort(
    (left, right) =>
      new Date(right.return_date).getTime() - new Date(left.return_date).getTime(),
  );

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("detailTitle")}</CardTitle>
        <CardDescription>
          {t("detailDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("borrowerTitle")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-4 bg-muted/20">
            <div>
              <p className="text-sm text-muted-foreground">{t("fullName")}</p>
              <p className="font-medium">
                {borrow.user?.profile?.full_name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("email")}</p>
              <p className="font-medium">{borrow.user?.email || "-"}</p>
            </div>
            {borrow.user?.profile?.identification_number && (
              <div>
                <p className="text-sm text-muted-foreground">{t("identificationNo")}</p>
                <p className="font-medium font-mono">
                  {borrow.user.profile.identification_number}
                </p>
              </div>
            )}
            {borrow.user?.profile?.phone_number && (
              <div>
                <p className="text-sm text-muted-foreground">{t("phoneNumber")}</p>
                <p className="font-medium">
                  {borrow.user.profile.phone_number}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t("datesTitle")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">{tRequest("borrowDate")}</p>
              <p className="font-medium">
                {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">{tRequest("returnDate")}</p>
              <p className="font-medium text-destructive">
                {format(new Date(borrow.return_date), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">{t("createdAt")}</p>
              <p className="font-medium">
                {format(new Date(borrow.created_at), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </div>

        {borrow.book_returns && borrow.book_returns.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              {t("returnRecords")} ({borrow.book_returns.length})
            </h3>
            <div className="grid gap-2">
              {returnRecords.map((ret) => (
                <div
                  key={ret.id}
                  className="rounded-lg border p-3 bg-muted/20 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {ret.book_copy?.book?.title || tCommon("noData")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {ret.book_copy?.copy_code || "-"}
                      </Badge>
                      <Badge
                        className={ret.condition === "damaged" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"}
                      >
                        {ret.condition || tCommon("noData")}
                      </Badge>
                    </div>
                  </div>
                  {ret.return_date && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ret.return_date), "dd MMM yyyy")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
