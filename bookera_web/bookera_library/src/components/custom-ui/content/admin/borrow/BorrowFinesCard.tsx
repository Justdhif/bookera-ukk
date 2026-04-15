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
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { fineService } from "@/services/fine.service";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface BorrowFinesCardProps {
  fines: Fine[];
  onUpdate: () => void;
}

export function BorrowFinesCard({ fines, onUpdate }: BorrowFinesCardProps) {
  const t = useTranslations("borrow");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleMarkAsPaid = async (fineId: number) => {
    try {
      setLoadingId(fineId);
      await fineService.markAsPaid(fineId);
      toast.success(t("markAsPaidSuccess"));
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("markAsPaidError"));
    } finally {
      setLoadingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (fines.length === 0) return null;

  return (
    <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <CreditCard className="h-24 w-24 text-amber-500" />
      </div>
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider text-sm">
          <CreditCard className="h-4 w-4" />
          {t("finesTitle")}
        </CardTitle>
        <CardDescription className="font-medium">
          {t("finesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid gap-4">
          {fines.map((fine) => (
            <div
              key={fine.id}
              className="flex items-center justify-between p-5 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm group hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                    {fine.fine_type?.name || t("fine")}
                  </p>
                  <p className="text-2xl font-black tracking-tight text-foreground">
                    {formatCurrency(fine.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge
                  className={
                    fine.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 font-bold"
                      : fine.status === "waived"
                        ? "bg-sky-500/10 text-sky-600 border-sky-500/20 px-3 py-1 font-bold"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/20 px-3 py-1 font-bold animate-pulse"
                  }
                  variant="outline"
                >
                  {fine.status.toUpperCase()}
                </Badge>

                {fine.status === "unpaid" && (
                  <Button
                    size="sm"
                    variant="brand"
                    className="h-10 px-5 gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    onClick={() => handleMarkAsPaid(fine.id)}
                    disabled={loadingId === fine.id}
                  >
                    {loadingId === fine.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {t("payBtn")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
