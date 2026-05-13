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
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

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
    <Card>
      <CardHeader>
        <CardTitle>{t("detailTitle")}</CardTitle>
        <CardDescription>
          {t("detailDescription")}
        </CardDescription>
      </CardHeader>
      <StaggerContainer as={CardContent} className="space-y-6">
        <FadeUp delay={0.1} className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("borrowerTitle")}
          </h3>
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/50 p-5 bg-muted/20 backdrop-blur-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{t("fullName")}</p>
              <p className="font-bold text-foreground truncate">
                {borrow.user?.profile?.full_name || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{t("email")}</p>
              <p className="font-bold text-foreground truncate">{borrow.user?.email || "-"}</p>
            </div>
            {borrow.user?.profile?.identification_number && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{t("identificationNo")}</p>
                <p className="font-bold font-mono text-foreground">
                  {borrow.user.profile.identification_number}
                </p>
              </div>
            )}
            {borrow.user?.profile?.phone_number && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{t("phoneNumber")}</p>
                <p className="font-bold text-foreground">
                  {borrow.user.profile.phone_number}
                </p>
              </div>
            )}
          </div>
        </FadeUp>

        <FadeUp delay={0.15} className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t("datesTitle")}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-border/50 p-4 bg-muted/20 backdrop-blur-sm flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{tRequest("borrowDate")}</p>
              <p className="font-bold text-foreground">
                {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-2xl border border-destructive/20 p-4 bg-destructive/5 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-destructive/70">{tRequest("returnDate")}</p>
              <p className="font-bold text-destructive">
                {format(new Date(borrow.return_date), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 p-4 bg-muted/20 backdrop-blur-sm flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{t("createdAt")}</p>
              <p className="font-bold text-foreground">
                {format(new Date(borrow.created_at), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </FadeUp>

        {borrow.book_returns && borrow.book_returns.length > 0 && (
          <FadeUp delay={0.2} className="space-y-3">
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
          </FadeUp>
        )}
      </StaggerContainer>
    </Card>
  );
}
