"use client";

import { Fine } from "@/types/fine";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface BorrowFinesCardProps {
  fines: Fine[];
}

export function BorrowFinesCard({ fines }: BorrowFinesCardProps) {
  const t = useTranslations("borrow");
  const tPublic = useTranslations("public");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (fines.length === 0) return null;

  return (
    <Card className="bg-amber-50/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <CreditCard className="h-5 w-5" />
          {t("finesTitle")}
        </CardTitle>
        <CardDescription className="text-amber-700/70">
          {t("finesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {fines.map((fine) => (
            <div
              key={fine.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 rounded-xl border border-amber-200/50 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-50">
                    {fine.fine_type?.name || t("fine")}
                  </p>
                  <p className="text-xl font-black text-primary">
                    {formatCurrency(fine.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={
                    fine.status === "paid"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : fine.status === "waived"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-red-100 text-red-700 border-red-200"
                  }
                  variant="outline"
                >
                  {tPublic(`fineStatus.${fine.status}`)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
