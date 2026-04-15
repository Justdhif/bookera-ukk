"use client";

import { Borrow } from "@/types/borrow";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, RotateCcw, User, Mail, Smartphone, Fingerprint } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface BorrowInfoCardProps {
  borrow: Borrow;
}

export function BorrowInfoCard({ borrow }: BorrowInfoCardProps) {
  const t = useTranslations("borrow");
  const tRequest = useTranslations("borrow-request");
  const tCommon = useTranslations("common");

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
              {borrow.book_returns.map((ret: any) => (
                <div
                  key={ret.id}
                  className="rounded-lg border p-3 bg-muted/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{tCommon("return")} #{ret.id}</p>
                    <BorrowStatusBadge status={ret.status} />
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
