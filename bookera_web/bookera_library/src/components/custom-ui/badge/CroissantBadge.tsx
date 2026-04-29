"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Croissant } from "lucide-react";
import { cn } from "@/lib/utils";

interface CroissantBadgeProps {
  className?: string;
}

export default function CroissantBadge({ className }: CroissantBadgeProps) {
  const t = useTranslations("profile");

  return (
    <Badge
      variant="outline"
      className={cn(
        "relative overflow-hidden group px-2 py-0.5 border-orange-200/50 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/30 backdrop-blur-sm text-orange-600 dark:text-orange-400 font-bold text-[10px] uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] dark:hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <div className="flex items-center gap-1.5 relative z-10">
        <Croissant className="w-3.5 h-3.5 text-orange-500 drop-shadow-[0_0_3px_rgba(249,115,22,0.5)]" />
        <span>{t("croissantBadgeLabel")}</span>
      </div>
    </Badge>
  );
}
