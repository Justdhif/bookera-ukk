"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Banknote, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";

interface PaymentMethodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPayCash: () => void;
  onPayMidtrans: () => void;
  totalAmount: number;
  loading: boolean;
}

export function PaymentMethodDialog({
  isOpen,
  onOpenChange,
  onPayCash,
  onPayMidtrans,
  totalAmount,
  loading,
}: PaymentMethodDialogProps) {
  const t = useTranslations("borrow.paymentDialog");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl gap-0">
        <div className="bg-brand-primary p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Banknote className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white text-left">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium text-left">
              {t("description", { amount: formatCurrency(totalAmount) })}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 space-y-4 bg-card">
          <Button
            variant="outline"
            className="w-full h-16 rounded-2xl justify-between px-6 border-2 hover:border-brand-primary hover:bg-brand-primary/5 group transition-all"
            onClick={onPayCash}
            disabled={loading}
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary group-hover:scale-110 transition-transform">
                <Banknote className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-foreground uppercase tracking-wider text-sm">{t("cashLabel")}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("cashDesc")}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 rounded-2xl justify-between px-6 border-2 hover:border-brand-primary hover:bg-brand-primary/5 group transition-all"
            onClick={onPayMidtrans}
            disabled={loading}
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary group-hover:scale-110 transition-transform">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-foreground uppercase tracking-wider text-sm">{t("nonCashLabel")}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("nonCashDesc")}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t flex flex-row items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-brand-primary animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t("processing")}</span>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
