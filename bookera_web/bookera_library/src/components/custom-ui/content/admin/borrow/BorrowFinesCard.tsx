"use client";

import { Fine } from "@/types/fine";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, CheckCircle2, Loader2, Banknote, QrCode } from "lucide-react";
import { fineService } from "@/services/fine.service";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BorrowFinesCardProps {
  fines: Fine[];
  onUpdate: () => void;
}

export function BorrowFinesCard({ fines, onUpdate }: BorrowFinesCardProps) {
  const router = useRouter();
  const t = useTranslations("borrow");
  const tPublic = useTranslations("public");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handlePayCash = async (fineId: number) => {
    try {
      setLoadingId(fineId);
      await fineService.payCash(fineId);
      toast.success("Fine paid via Cash!");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("markAsPaidError"));
    } finally {
      setLoadingId(null);
    }
  };

  const handleStartPayment = (fineId: number) => {
    router.push(`/admin/payment?type=fine&id=${fineId}`);
  };

  const handlePayMidtrans = async (fineId: number) => {
    handleStartPayment(fineId);
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
        <StaggerContainer className="grid gap-4">
          {fines.map((fine) => (
            <SlideIn
              key={fine.id}
              direction="up"
              distance={20}
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
                    {formatCurrency(Number(fine.amount))}
                  </p>
                  {fine.fine_type?.description && (
                    <p className="text-sm font-medium text-muted-foreground/80 mt-1 max-w-md">
                      {fine.fine_type.description}
                    </p>
                  )}
                  {fine.notes && (
                    <p className="text-sm font-medium text-muted-foreground/80 mt-1 max-w-md italic">
                      {fine.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={cn(
                      "px-3 py-1 font-bold",
                      fine.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : fine.status === "waived"
                          ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse"
                    )}
                    variant="outline"
                  >
                    {tPublic(`fineStatus.${fine.status}`)}
                  </Badge>
                  {fine.payment_method && (
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      {fine.payment_method === 'cash' ? <Banknote className="h-2.5 w-2.5" /> : <QrCode className="h-2.5 w-2.5" />}
                      Via {fine.payment_method}
                    </span>
                  )}
                </div>

                {fine.status === "unpaid" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="brand"
                        className="h-10 px-5 gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        disabled={loadingId === fine.id}
                      >
                        {loadingId === fine.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {t("payBtn")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl p-2 min-w-[160px]">
                      <DropdownMenuItem 
                        onClick={() => handlePayCash(fine.id)}
                        className="rounded-lg gap-2 font-bold p-3 cursor-pointer"
                      >
                        <Banknote className="h-4 w-4 text-emerald-500" />
                        Pay via Cash
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handlePayMidtrans(fine.id)}
                        className="rounded-lg gap-2 font-bold p-3 cursor-pointer"
                      >
                        <QrCode className="h-4 w-4 text-brand-primary" />
                        Pay via Midtrans
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </SlideIn>
          ))}
        </StaggerContainer>
      </CardContent>
    </Card>
  );
}
