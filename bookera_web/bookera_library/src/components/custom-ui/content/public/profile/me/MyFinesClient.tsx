"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { fineService } from "@/services/fine.service";
import { Fine } from "@/types/fine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
import EmptyState from "@/components/custom-ui/EmptyState";
import { DollarSign, BookOpen, Calendar, AlertCircle } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import { format } from "date-fns";
import { StaggerContainer, FadeUp, FadeIn, ScaleIn } from "@/components/custom-ui/motion";

type FineBorrowGroup = {
  borrowId: number;
  borrow?: Fine["borrow"];
  fines: Fine[];
};

const groupFinesByBorrow = (fines: Fine[]): FineBorrowGroup[] => {
  return [...fines]
    .sort((left, right) => {
      if (left.borrow_id !== right.borrow_id) {
        return left.borrow_id - right.borrow_id;
      }

      return left.id - right.id;
    })
    .reduce<FineBorrowGroup[]>((groups, fine) => {
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.borrowId === fine.borrow_id) {
        lastGroup.fines.push(fine);
        return groups;
      }

      groups.push({
        borrowId: fine.borrow_id,
        borrow: fine.borrow,
        fines: [fine],
      });

      return groups;
    }, []);
};

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function MyFinesClient() {
  const router = useRouter();
  const t = useTranslations("public");
  const tProfile = useTranslations("profile");
  const { user: currentUser } = useAuthStore();
  const isMe = true;

  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await fineService.getByUser();
      setFines(response.data.data);
    } catch (error) {
      console.error("Failed to fetch fines:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const groupedFines = groupFinesByBorrow(fines);

  return (
    <StaggerContainer className="pt-1 md:pt-2 px-0">
      <ContentHeader
        title={isMe ? t("myFines") : tProfile("fine")}
        description={t("viewAllFinesDesc")}
        showBackButton={false}
        className="mb-8"
      />

      {loading ? (
        <FadeIn key="loading" className="flex justify-center py-12">
          <DataLoading variant="inline" size="lg" />
        </FadeIn>
      ) : fines.length === 0 ? (
        <FadeIn key="empty">
          <EmptyState
            icon={<DollarSign />}
            title={t("noFinesYet")}
            description={t("noFinesYetDesc")}
          />
        </FadeIn>
      ) : (
        <div className="grid gap-4">
          {groupedFines.map((group, index) => {
            const borrow = group.borrow;

            return (
              <ScaleIn key={group.borrowId} delay={index * 0.05}>
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">
                            {t("borrowHash")}
                            {group.borrowId}
                          </CardTitle>
                          {borrow?.borrow_code && (
                            <Badge variant="outline">{borrow.borrow_code}</Badge>
                          )}
                        </div>
                        {borrow?.borrow_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div className="grid gap-3">
                        {group.fines.map((fine) => (
                          <div
                            key={fine.id}
                            className="rounded-lg border bg-background p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold">
                                    {t("fineNumber")}
                                    {fine.id}
                                  </p>
                                  <FineStatusBadge status={fine.status} />
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {format(new Date(fine.created_at), "dd MMM yyyy")}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  {t("fineAmountLabel")}
                                </p>
                                <p className="text-xl font-bold text-red-600">
                                  {formatCurrency(fine.amount)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  {t("fineTypeLabel")}
                                </p>
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                  <p className="font-medium">{fine.fine_type?.name}</p>
                                </div>
                                {fine.fine_type?.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {fine.fine_type.description}
                                  </p>
                                )}
                              </div>

                              {fine.notes && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">
                                    {t("notesLabel")}
                                  </p>
                                  <p className="text-sm">{fine.notes}</p>
                                </div>
                              )}

                              {fine.waive_reason && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                  <p className="text-sm font-medium text-green-800 mb-1">
                                    {t("waivedLabel")}
                                  </p>
                                  <p className="text-sm text-green-700">
                                    {fine.waive_reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScaleIn>
            );
          })}
        </div>
      )}
    </StaggerContainer>
  );
}


