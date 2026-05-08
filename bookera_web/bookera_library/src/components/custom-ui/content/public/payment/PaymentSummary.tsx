"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { PaymentData } from "./PaymentClient";

interface PaymentSummaryProps {
  paymentData: PaymentData | null;
  itemDetails: any;
  checking: boolean;
  onManualCheck: () => void;
}

export default function PaymentSummary({
  paymentData,
  itemDetails,
  checking,
  onManualCheck,
}: PaymentSummaryProps) {
  const t = useTranslations("payment.dialog");

  const totalAmount = paymentData?.amount || itemDetails?.price || itemDetails?.amount || 0;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="space-y-1 text-center md:text-left">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          {t("totalPayment")}
        </p>
        <p className="text-3xl md:text-4xl font-black text-emerald-500 tracking-tight">
          {formatCurrency(totalAmount)}
        </p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <Button
          size="lg"
          className={cn(
            "w-full md:w-auto h-14 px-8 rounded-xl font-black text-sm gap-3 transition-all duration-500 group shadow-lg text-white",
            paymentData
              ? "bg-linear-to-r from-brand-primary to-brand-primary-dark shadow-brand-primary/20 hover:scale-[1.02]"
              : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
          )}
          onClick={onManualCheck}
          disabled={checking || !paymentData}
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("checkingStatus")}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3px]" />
              {t("confirmButton")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
