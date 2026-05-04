"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sparkles, Crown, Check, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MembershipPlan } from "@/services/membership.service";
import { MemberBadgeIcon } from "@/components/custom-ui/badge/MemberBadge";

interface PricingCardProps {
  plan: MembershipPlan;
  isCurrentPlan: boolean;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isLoading: boolean;
  snapLoaded: boolean;
  onPay: (planId: string) => void;
}

export default function PricingCard({
  plan,
  isCurrentPlan,
  isLoggedIn,
  isAuthLoading,
  isLoading,
  snapLoaded,
  onPay,
}: PricingCardProps) {
  const tp = useTranslations("pricing");
  const tc = useTranslations("common");
  const showLoginButton = !isAuthLoading && !isLoggedIn;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 shadow-2xl",
        isCurrentPlan
          ? "border-amber-400 bg-linear-to-br from-amber-400/10 via-card to-amber-500/5 shadow-amber-400/20"
          : "border-brand-primary bg-linear-to-br from-brand-primary/8 via-card to-purple-500/5 shadow-brand-primary/15",
      )}
    >
      {/* Decorative elements */}
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-30",
          isCurrentPlan ? "bg-amber-400" : "bg-brand-primary",
        )}
      />
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-current to-transparent opacity-50",
          isCurrentPlan ? "text-amber-400" : "text-brand-primary",
        )}
      />

      <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-0">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black tracking-wide shadow-sm",
            isCurrentPlan
              ? "bg-amber-400/10 border-amber-400/30 text-amber-600 dark:text-amber-400"
              : "bg-brand-primary/10 border-brand-primary/25 text-brand-primary",
          )}
        >
          {isCurrentPlan ? (
            <Crown className="w-3.5 h-3.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {tp("lifetimeMember").toUpperCase()}
        </div>
        {!isCurrentPlan && (
          <div className="text-xs text-muted-foreground font-bold italic opacity-70">
            {tp("oneTimePayment")}
          </div>
        )}
      </div>

      <div className="relative z-10 p-8 sm:p-10 pt-6">
        {isCurrentPlan ? (
          <div className="flex flex-col md:flex-row items-center gap-8 py-4">
            <div className="w-24 h-24 rounded-[2rem] bg-amber-400/20 border-2 border-amber-400/40 flex items-center justify-center shadow-xl shadow-amber-400/20">
              <MemberBadgeIcon className="w-14 h-14 border-none shadow-none bg-transparent" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-3xl font-black text-foreground tracking-tight">
                {tp("alreadyMemberInfo")}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-lg font-medium">
                {tp("exclusiveBadgeDesc")}
              </p>
              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
                <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-600 uppercase tracking-widest">
                  {tc("status")}: {tc("active")}
                </div>
                <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-600 uppercase tracking-widest">
                  {tp("perForever")}
                </div>
              </div>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-auto min-w-52 h-14 rounded-2xl border-amber-400/50 text-amber-600 dark:text-amber-400 bg-amber-400/5 hover:bg-amber-400/10 font-black text-lg transition-all"
                disabled
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {tp("alreadyMember")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-end gap-3 leading-none">
                <span className="text-6xl sm:text-7xl font-black text-foreground tracking-tighter">
                  {formatPrice(plan.price)}
                </span>
                <span className="text-base text-muted-foreground font-bold mb-2 opacity-60">
                  {tp("perForever")}
                </span>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md font-medium">
                {plan.description}
              </p>
            </div>

            <div className="shrink-0">
              {showLoginButton ? (
                <Link href="/login?redirect=/pricing">
                  <Button
                    variant="brand"
                    size="lg"
                    className="w-full sm:w-auto min-w-60 h-16 rounded-2xl text-xl font-black shadow-2xl shadow-brand-primary/30 hover:shadow-brand-primary/40 hover:-translate-y-1 active:scale-95 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-3" />
                    {tp("loginNow")}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full sm:w-auto min-w-60 h-16 rounded-2xl text-xl font-black shadow-2xl shadow-brand-primary/30 hover:shadow-brand-primary/40 hover:-translate-y-1 active:scale-95 transition-all duration-300"
                  disabled={isLoading || !snapLoaded}
                  onClick={() => onPay(String(plan.id))}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-3" />
                  )}
                  {tp("upgradeNow")}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-border/50 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
          {[
            { icon: Check, text: tp("featureAccess") },
            { icon: Check, text: tp("exclusiveBadge") },
            { icon: Check, text: tp("aiAssistant") },
            { icon: Check, text: tp("priorityReservation") },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                  isCurrentPlan
                    ? "bg-amber-400/20 text-amber-600"
                    : "bg-brand-primary/15 text-brand-primary",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
