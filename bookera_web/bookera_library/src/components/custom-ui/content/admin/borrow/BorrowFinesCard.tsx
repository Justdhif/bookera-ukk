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
import { CreditCard, AlertCircle, Loader2, Banknote, QrCode } from "lucide-react";
import { fineService } from "@/services/fine.service";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import { cn } from "@/lib/utils";
import { PaymentMethodDialog } from "./PaymentMethodDialog";

interface BorrowFinesCardProps {
  fines: Fine[];
  onUpdate: () => void;
}

export function BorrowFinesCard({ fines, onUpdate }: BorrowFinesCardProps) {
  const router = useRouter();
  const t = useTranslations("borrow");
  const tPublic = useTranslations("public");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);

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

  const unpaidFines = fines.filter((fine) => fine.status === "unpaid");
  const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + Number(fine.amount), 0);

  const handlePayAllCash = async () => {
    try {
      setLoadingId(-1);
      let lastFineId: number | null = null;
      
      for (const fine of unpaidFines) {
        await fineService.payCash(fine.id);
        lastFineId = fine.id;
      }
      
      toast.success("All fines paid via Cash!");
      onUpdate();
      setIsMethodDialogOpen(false);
      
      // Redirect to invoice page for the last fine (or generic success)
      if (lastFineId) {
        router.push(`/admin/payment/success?type=fine&id=${lastFineId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("markAsPaidError"));
    } finally {
      setLoadingId(null);
    }
  };

  const handlePayAllMidtrans = () => {
    // For Midtrans, since it's individual, we'll pick the first one
    if (unpaidFines.length > 0) {
      setIsMethodDialogOpen(false);
      router.push(`/admin/payment?type=fine&id=${unpaidFines[0].id}`);
    }
  };

  if (fines.length === 0) return null;

  return (
    <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <CreditCard className="h-24 w-24 text-amber-500" />
      </div>
      <CardHeader className="pb-4 border-b border-amber-500/10 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider text-sm">
              <CreditCard className="h-4 w-4" />
              {t("finesTitle")}
            </CardTitle>
            <CardDescription className="font-medium">
              {t("finesDesc")}
            </CardDescription>
          </div>
          
          {unpaidFines.length > 0 && (
            <Button
              size="sm"
              variant="brand"
              className="h-10 px-6 font-black gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0"
              onClick={() => setIsMethodDialogOpen(true)}
              disabled={loadingId !== null}
            >
              {loadingId === -1 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Banknote className="h-4 w-4" />
              )}
              {t("payAllBtn") || `Pay All (${formatCurrency(totalUnpaid)})`}
            </Button>
          )}
        </div>
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
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-black tracking-tight text-foreground">
                      {formatCurrency(Number(fine.amount))}
                    </p>
                    {fine.original_amount && Number(fine.original_amount) > Number(fine.amount) && (
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-muted-foreground line-through decoration-rose-500/50">
                          {formatCurrency(Number(fine.original_amount))}
                        </p>
                        {fine.membership_discount && (
                          <Badge 
                            variant="outline" 
                            className="h-4 px-1.5 text-[8px] font-black uppercase bg-emerald-500/5 text-emerald-600 border-emerald-500/20 tracking-tighter"
                          >
                            {fine.membership_discount.name} -{fine.membership_discount.discount_percentage}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {fine.fine_type?.description && (
                    <p className="text-[11px] font-medium text-muted-foreground/80 mt-1.5 max-w-md leading-relaxed">
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

              </div>
            </SlideIn>
          ))}
        </StaggerContainer>
      </CardContent>

      <PaymentMethodDialog
        isOpen={isMethodDialogOpen}
        onOpenChange={setIsMethodDialogOpen}
        onPayCash={handlePayAllCash}
        onPayMidtrans={handlePayAllMidtrans}
        totalAmount={totalUnpaid}
        loading={loadingId === -1}
      />
    </Card>
  );
}
