"use client";

import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BankOption, PaymentData } from "./PaymentClient";

interface PaymentBankSelectionProps {
  banks: BankOption[];
  selectedBank: string | null;
  paymentData: PaymentData | null;
  loading: boolean;
  onBankSelect: (bankId: string) => void;
}

export default function PaymentBankSelection({
  banks,
  selectedBank,
  paymentData,
  loading,
  onBankSelect,
}: PaymentBankSelectionProps) {
  const t = useTranslations("payment.dialog");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-base uppercase tracking-wider text-foreground">
          {t("selectMethodTitle")}
        </h3>
        {loading && (
          <div className="flex items-center gap-2 text-brand-primary animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {t("checkingStatus")}
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {banks.map((bank) => (
          <button
            key={bank.id}
            onClick={(e) => {
              e.stopPropagation();
              onBankSelect(bank.id);
            }}
            disabled={loading || !!paymentData}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 group relative cursor-pointer",
              selectedBank === bank.id
                ? "bg-white border-brand-primary shadow-lg shadow-brand-primary/10"
                : "bg-white border-border hover:border-brand-primary/20",
              !!paymentData && selectedBank !== bank.id && "opacity-40 grayscale"
            )}
          >
            <div className="relative w-full flex items-center justify-center h-10">
              <div className="relative w-20 h-8">
                <Image
                  src={bank.logo}
                  alt={bank.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {selectedBank === bank.id && (
              <div className="absolute top-2 right-2">
                <div className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center animate-in zoom-in duration-300">
                  <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
