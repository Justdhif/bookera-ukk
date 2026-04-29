"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export default function AdminBadge({ className, showIcon = true }: AdminBadgeProps) {
  const t = useTranslations("profile");

  return (
    <Badge
      variant="outline"
      className={cn(
        "relative overflow-hidden group px-2 py-0.5 border-red-200/50 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/30 backdrop-blur-sm text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] dark:hover:shadow-[0_0_15px_rgba(220,38,38,0.1)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-r from-red-500/0 via-red-500/5 to-red-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <div className="flex items-center gap-1 relative z-10">
        {showIcon && <ShieldCheck className="w-3 h-3 animate-pulse-slow" />}
        <span>{t("adminBadgeLabel")}</span>
      </div>
    </Badge>
  );
}
