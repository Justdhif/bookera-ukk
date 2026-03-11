"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { fineService } from "@/services/fine.service";
import { Fine } from "@/types/fine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/custom-ui/EmptyState";
import { DollarSign, BookOpen, Calendar, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function MyFinesPageClient() {
    const t = useTranslations("public");
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await fineService.getMyFines();
      setFines(response.data.data);
    } catch (error) {
      console.error("Failed to fetch fines:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Fine["status"]) => {
    const statusConfig: Record<
      Fine["status"],
      { variant: any; label: string; className?: string }
    > = {
      unpaid: {
        variant: "destructive",
        label: "Unpaid",
        className: "bg-red-100 text-white hover:bg-red-100",
      },
      paid: {
        variant: "default",
        label: "Paid",
        className: "bg-green-100 text-white hover:bg-green-100",
      },
      waived: {
        variant: "secondary",
        label: "Waived",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      },
    };

    return (
      <Badge
        variant={statusConfig[status]?.variant || "secondary"}
        className={statusConfig[status]?.className}
      >
        {statusConfig[status]?.label || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (fines.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("myFines")}</h1>
            <p className="text-muted-foreground">{t("viewAllFinesDesc")}</p>
          </div>
        </div>
        <EmptyState
          icon={<DollarSign className="h-16 w-16" />}
          title={t("noFinesYet")}
          description={t("noFinesYetDesc")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-brand-primary rounded-lg">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t("myFines")}</h1>
          <p className="text-muted-foreground">{t("viewAllFinesDesc")}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {fines.map((fine) => (
          <Card key={fine.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">Fine #{fine.id}</CardTitle>
                    {getStatusBadge(fine.status)}
                    {fine.borrow_id && (
                      <Badge variant="outline">{t("loanNumber")}{fine.borrow_id}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(fine.created_at), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t("fineAmountLabel")}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(fine.amount)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
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

                {fine.borrow?.borrow_details &&
                  fine.borrow.borrow_details.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        {t("relatedBooksLabel")}
                      </p>
                      <div className="grid gap-2">
                        {fine.borrow.borrow_details.map((detail) => (
                          <div
                            key={detail.id}
                            className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3"
                          >
                            <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {detail.book_copy?.book?.title || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("copyCodeLabel")}: {detail.book_copy?.copy_code}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
