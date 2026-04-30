"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useTranslations } from "next-intl";

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("payment");
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-xl shadow-red-500/20 animate-in zoom-in-50 duration-500">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {t("errorTitle")}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("errorDescription")}
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground/70 font-mono">
              Order ID: {orderId}
            </p>
          )}
        </div>

        {/* Possible reasons */}
        <div className="rounded-2xl bg-muted/40 border border-border/50 p-5 text-left space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">
            {t("possibleCauses")}
          </p>
          <p>• {t("cause1")}</p>
          <p>• {t("cause2")}</p>
          <p>• {t("cause3")}</p>
          <p>• {t("cause4")}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/pricing" className="w-full">
            <Button
              variant="brand"
              size="lg"
              className="w-full shadow-xl shadow-brand-primary/25"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("tryAgain")}
            </Button>
          </Link>
          <Link href="/home">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backHome")}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("needHelp")}{" "}
          <Link
            href="/complaints"
            className="text-brand-primary underline-offset-2 hover:underline"
          >
            {t("contactAdmin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
