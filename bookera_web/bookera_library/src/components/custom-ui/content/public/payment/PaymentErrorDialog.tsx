"use client";

import { motion } from "framer-motion";
import { X, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentErrorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
}

export default function PaymentErrorDialog({
  isOpen,
  onOpenChange,
  onRetry,
}: PaymentErrorDialogProps) {
  const t = useTranslations("payment.dialog");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("checkError")}</DialogTitle>
          <DialogDescription>{t("errorHint")}</DialogDescription>
        </DialogHeader>

        <div className="bg-linear-to-br from-red-500 to-red-700 p-12 flex flex-col items-center text-center space-y-6 text-white relative">
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
              <X className="w-12 h-12 text-red-500 stroke-[4px]" />
            </div>
          </motion.div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-3xl font-black tracking-tight">
              {t("checkError", { defaultValue: "Pembayaran Gagal" })}
            </h2>
            <p className="text-white/80 font-medium">
              {t("errorHint", { defaultValue: "Terjadi kesalahan saat memproses pembayaran. Silakan coba beberapa saat lagi." })}
            </p>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-14 bg-white text-red-500 hover:bg-white/90 rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all hover:scale-[1.02]"
          >
            {t("tryAgain", { defaultValue: "Coba Lagi" })}
            <RefreshCcw className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
