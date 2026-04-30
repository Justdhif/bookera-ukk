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
        "relative overflow-hidden group h-4 w-4 p-0 flex items-center justify-center shrink-0 border-brand-primary/20 dark:border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10 backdrop-blur-sm text-brand-primary transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/30",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-r from-brand-primary/0 via-brand-primary/10 to-brand-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <div className="flex items-center justify-center relative z-10">
        {showIcon && <ShieldCheck className="w-3 h-3 animate-pulse" />}
      </div>
    </Badge>
  );
}
