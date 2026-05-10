"use client";

import { Clock, ReceiptText, BadgeCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PaymentData } from "./PaymentClient";
import { formatCurrency } from "@/lib/utils";

interface PaymentInstructionsProps {
  paymentData: PaymentData | null;
  itemDetails: any;
  type: string | null;
}

export default function PaymentInstructions({
  paymentData,
  itemDetails,
  type,
}: PaymentInstructionsProps) {
  const t = useTranslations("payment.dialog");

  return (
    <div className="space-y-8 mt-4">
      {paymentData && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ReceiptText className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">
                {t("vaLabel")} {paymentData.bank.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="px-3 py-1 bg-muted rounded-full text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                {t("orderRef", { orderId: paymentData.order_id })}
              </div>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentData.va_number);
                  toast.success(t("copySuccess", { defaultValue: "Nomor VA berhasil disalin!" }));
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 rounded-full transition-all hover:scale-105 active:scale-95 group/copy"
                title={t("copyBtn")}
              >
                <Copy className="w-3 h-3 text-brand-primary group-hover/copy:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider">{t("copyBtn", { defaultValue: "SALIN" })}</span>
              </button>

              <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-nowrap items-center justify-between gap-1 md:gap-2 w-full overflow-x-auto pb-2">
              {paymentData.va_number.split("").map((char, idx) => (
                <span
                  key={idx}
                  className="text-xl sm:text-2xl md:text-4xl font-black text-foreground font-mono leading-none shrink-0"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
 
          {/* Deadline Section */}
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10 rounded-xl w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200/80">
              {t("deadline")}:{" "}
              <span className="text-amber-600 dark:text-amber-400 font-black">
                {paymentData.expiry_time
                  ? new Date(paymentData.expiry_time).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : t("deadlineFallback")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Payment Breakdown */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
            <ReceiptText className="w-4 h-4 text-brand-primary" />
          </div>
          <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("paymentDetails", { defaultValue: "Detail Pembayaran" })}
          </h4>
        </div>

        <div className="bg-muted/30 rounded-2xl border overflow-hidden">
          <div className="p-5 space-y-3">
            {type === "membership" && itemDetails && (
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    {t("membershipLabel", { defaultValue: "Membership" })}: {itemDetails.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{itemDetails.description}</p>
                </div>
                <span className="text-sm font-black text-foreground">
                  {formatCurrency(itemDetails.price)}
                </span>
              </div>
            )}

            {type === "fine" && itemDetails && (
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    {itemDetails.fine_type?.name || t("lateFine", { defaultValue: "Denda Keterlambatan" })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("borrowId", { defaultValue: "Pinjaman" })} #{itemDetails.borrow_id || itemDetails.id}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-sm font-black text-foreground">
                    {formatCurrency(Number(itemDetails.amount))}
                  </span>
                  {itemDetails.original_amount && Number(itemDetails.original_amount) > Number(itemDetails.amount) && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground line-through decoration-rose-500 decoration-2">
                        {formatCurrency(Number(itemDetails.original_amount))}
                      </span>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-1 rounded">
                        -{itemDetails.discount_percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-dashed flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground">
                {t("serviceFee", { defaultValue: "Biaya Layanan" })}
              </span>
              <span className="text-xs font-bold text-emerald-500">
                {t("free", { defaultValue: "Gratis" })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
