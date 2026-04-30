"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export function MemberBadgeIcon({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "relative overflow-hidden group h-4 w-4 p-0 flex items-center justify-center shrink-0 border-amber-400/20 dark:border-amber-400/30 bg-amber-400/5 dark:bg-amber-400/10 backdrop-blur-sm text-amber-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/30",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <div className="flex items-center justify-center relative z-10">
        <Crown className="w-3 h-3 animate-pulse" />
      </div>
    </Badge>
  );
}

export default function MemberBadge({ className, showIcon = true }: MemberBadgeProps) {
  const t = useTranslations("profile");

  return (
    <Badge
      variant="outline"
      className={cn(
        "relative overflow-hidden group px-2 py-0.5 flex items-center gap-1.5 shrink-0 border-amber-400/20 dark:border-amber-400/30 bg-amber-400/5 dark:bg-amber-400/10 backdrop-blur-sm text-amber-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/30 h-5",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <div className="flex items-center justify-center relative z-10">
        {showIcon && <Crown className="w-3 h-3 animate-pulse" />}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">
        {t("memberBadgeLabel")}
      </span>
    </Badge>
  );
}

