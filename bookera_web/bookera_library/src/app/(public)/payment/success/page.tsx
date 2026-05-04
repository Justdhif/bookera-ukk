"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { membershipService } from "@/services/membership.service";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MemberBadgeIcon } from "@/components/custom-ui/badge/MemberBadge";
import { setCookie } from "cookies-next";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const t = useTranslations("payment");
  const tp = useTranslations("pricing");
  const tc = useTranslations("common");
  const orderId = searchParams.get("order_id");
  const isPending = searchParams.get("status") === "pending";
  const [checking, setChecking] = useState(true);
  const [dbStatus, setDbStatus] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15; // Poll for 45 seconds max

    const check = async () => {
      try {
        const res = await membershipService.checkStatus();
        const data = res.data.data;
        const memberStatus = data.is_member;
        const currentStatus = data.transaction?.status || null;

        setDbStatus(currentStatus);

        if (memberStatus && user) {
          setUser({ ...user, role: "member" });
          setCookie("role", "member", { maxAge: 60 * 60 * 24, path: "/" });
        }

        // Stop polling if success or failed
        if (currentStatus === "paid" || currentStatus === "failed") {
          setChecking(false);
          return true;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setChecking(false);
        return true;
      }
      return false;
    };

    // Initial check
    check();

    // Set up interval for polling
    const interval = setInterval(async () => {
      const shouldStop = await check();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, setUser]);

  const showPending = isPending || dbStatus === "pending" || checking;
  const isSuccess = dbStatus === "paid";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          {showPending ? (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-xl">
                <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
              </div>
            </div>
          ) : isSuccess ? (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-xl shadow-green-500/20 animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="absolute -top-2 -right-2 animate-in zoom-in-75 duration-700 delay-200">
                <MemberBadgeIcon className="w-10 h-10 border-4 border-background rounded-full shadow-md" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-12 h-12 text-red-500" />
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {showPending
              ? t("pendingTitle")
              : isSuccess
                ? t("successTitle")
                : t("errorTitle")}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {showPending
              ? t("pendingDescription")
              : isSuccess
                ? t("successDescription")
                : t("errorDescription")}
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground/70 font-mono">
              Order ID: {orderId}
            </p>
          )}
        </div>

        {/* Member perks preview */}
        {isSuccess && (
          <div className="rounded-2xl bg-linear-to-br from-brand-primary/10 to-purple-500/10 border border-brand-primary/20 p-5 text-left space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              {t("activeBenefits")}
            </p>
            {[
              "featureAccess",
              "exclusiveBadge",
              "aiAssistant",
              "priorityReservation",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {tp(f)}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/home" className="w-full">
            <Button
              variant="brand"
              size="lg"
              className="w-full shadow-xl shadow-brand-primary/25"
            >
              {t("backToLibrary")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/pricing" className="w-full">
            <Button variant="outline" size="lg" className="w-full">
              {tc("view") + " Membership"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
