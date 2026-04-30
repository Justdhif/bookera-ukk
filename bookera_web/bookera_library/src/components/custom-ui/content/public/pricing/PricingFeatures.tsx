"use client";

import { useTranslations } from "next-intl";
import { CalendarCheck, Bell, Sparkles } from "lucide-react";
import Image from "next/image";
import boteraLogo from "@/assets/logo/botera.png";

export function PricingCommonFeatures() {
  const tp = useTranslations("pricing");

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Reservation Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-md hover:border-brand-primary/20 flex-1 flex flex-col">
        <div className="pointer-events-none absolute top-0 right-0 w-28 h-28 rounded-full bg-brand-primary/5 blur-2xl" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-primary/15 to-brand-primary/5 border border-brand-primary/20 flex items-center justify-center mb-4">
            <CalendarCheck className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1.5">
            {tp("reservationTitle")}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed flex-1">
            {tp("reservationDesc")}
          </p>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>{tp("slotsRemaining")}</span>
              <span className="font-semibold text-brand-primary">3 / 5</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-3/5 rounded-full bg-linear-to-r from-brand-primary to-brand-primary/70" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {tp("memberPriority")}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-md hover:border-brand-primary/20 flex-1 flex flex-col">
        <div className="pointer-events-none absolute bottom-0 left-0 w-28 h-28 rounded-full bg-violet-500/5 blur-2xl" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500/15 to-violet-500/5 border border-violet-500/20 flex items-center justify-center mb-4">
            <Bell className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1.5">
            {tp("notificationTitle")}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed flex-1">
            {tp("notificationDesc")}
          </p>
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 rounded-lg bg-green-500/8 border border-green-500/15 px-2.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <p className="text-[10px] text-foreground/70 truncate">
                {tp("waStatus")}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-blue-500/8 border border-blue-500/15 px-2.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <p className="text-[10px] text-foreground/70 truncate">
                {tp("emailStatus")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingAICard() {
  const tp = useTranslations("pricing");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10 dark:border-brand-primary/40 hover:border-brand-primary/60 hover:shadow-lg hover:shadow-brand-primary/10 backdrop-blur-sm p-6 transition-all duration-300 flex flex-col h-full">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-white/10 via-transparent to-transparent dark:from-white/5" />
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-primary/20 to-purple-500/20 border border-brand-primary/30 backdrop-blur-md flex items-center justify-center shadow-inner dark:from-brand-primary/30 dark:to-purple-500/30">
              <Image
                src={boteraLogo}
                alt="Botera AI"
                width={30}
                height={30}
                className="object-contain drop-shadow"
              />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-card shadow-sm animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-brand-primary uppercase tracking-widest mb-0.5">
              AI Powered
            </div>
            <p className="text-sm font-bold text-foreground leading-snug">
              {tp("aiTitle")}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {tp("aiDesc")}
        </p>

        <div className="flex-1 flex flex-col justify-between gap-2.5 rounded-xl bg-card/50 dark:bg-card/30 border border-border/40 p-3">
          <div className="flex flex-col gap-2.5">
            <div className="self-end max-w-[88%] rounded-2xl rounded-tr-sm bg-muted/70 border border-border/50 px-3 py-2">
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                Rekomendasikan buku thriller mirip "Gone Girl" 📚
              </p>
            </div>
            <div className="self-start max-w-[88%] rounded-2xl rounded-tl-sm bg-brand-primary/15 border border-brand-primary/20 px-3 py-2">
              <p className="text-[11px] text-brand-primary font-medium leading-relaxed">
                Coba <span className="font-bold">"The Silent Patient"</span> —
                psikologis, plot twist keren! ✨
              </p>
            </div>
            <div className="self-end max-w-[88%] rounded-2xl rounded-tr-sm bg-muted/70 border border-border/50 px-3 py-2">
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                Ada stoknya di perpustakaan?
              </p>
            </div>
            <div className="self-start max-w-[88%] rounded-2xl rounded-tl-sm bg-brand-primary/15 border border-brand-primary/20 px-3 py-2">
              <p className="text-[11px] text-brand-primary font-medium leading-relaxed">
                Ada! Mau langsung saya{" "}
                <span className="font-bold">reservasikan</span>? 🎯
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-border/60 px-3 py-2 mt-1">
            <span className="text-[10px] text-muted-foreground flex-1">
              Tanya Botera AI...
            </span>
            <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-brand-primary" />
            </div>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 text-[10px] font-semibold text-brand-primary dark:bg-brand-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          {tp("aiBadge")}
        </div>
      </div>
    </div>
  );
}
