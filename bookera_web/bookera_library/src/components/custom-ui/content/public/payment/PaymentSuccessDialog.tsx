"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function PaymentSuccessDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: PaymentSuccessDialogProps) {
  const t = useTranslations("payment.dialog");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && countdown === 0) {
      onConfirm();
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, onConfirm]);

  // Reset countdown when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("transactionSuccess")}</DialogTitle>
          <DialogDescription>{t("successHint")}</DialogDescription>
        </DialogHeader>
        
        <div className="bg-linear-to-br from-brand-primary to-brand-primary-dark p-12 flex flex-col items-center text-center space-y-6 text-white relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <Check className="w-12 h-12 text-brand-primary stroke-[4px]" />
            </div>
          </motion.div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-3xl font-black tracking-tight">
              {t("transactionSuccess")}
            </h2>
            <p className="text-white/80 font-medium">
              {t("successHint", { defaultValue: "Pembayaran Anda telah diverifikasi dan diproses oleh sistem." })}
            </p>
          </div>

          <div className="flex flex-col w-full gap-4 pt-2">
            <div className="flex items-center justify-center gap-2 text-white/60">
              <Timer className="w-4 h-4 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                {t("redirectingIn", { defaultValue: "Redirecting in" })} <span className="text-white">{countdown}s</span>
              </p>
            </div>

            <Button
              onClick={onConfirm}
              className="w-full h-14 bg-white text-brand-primary hover:bg-white/90 rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all hover:scale-[1.02]"
            >
              {t("continue", { defaultValue: "Lanjutkan" })}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
