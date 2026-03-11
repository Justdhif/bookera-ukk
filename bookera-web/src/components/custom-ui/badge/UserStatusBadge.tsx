"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export default function UserStatusBadge({
  isActive,
  className,
}: UserStatusBadgeProps) {
  const t = useTranslations("profile");

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        isActive
          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800"
          : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700",
        className,
      )}
    >
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
