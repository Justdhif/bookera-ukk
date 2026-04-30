"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";

export default function PricingHeader() {
  const tp = useTranslations("pricing");

  return (
    <>
      <ContentHeader
        title={tp("title")}
        description={tp("description")}
        showBackButton
      />

      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-primary via-brand-primary-dark to-purple-900 p-8 sm:p-12 text-white">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.07]" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {tp("lifetimeBadge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-4">
            {tp("heroTitle")}
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
            {tp("heroSubtitle")}
          </p>
        </div>
      </div>
    </>
  );
}
