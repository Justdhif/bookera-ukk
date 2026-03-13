"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BorrowDetailStatus = "borrowed" | "returned" | "lost";

interface BorrowDetailStatusBadgeProps {
  status: BorrowDetailStatus;
  className?: string;
}

export default function BorrowDetailStatusBadge({
  status,
  className,
}: BorrowDetailStatusBadgeProps) {
  const t = useTranslations("borrowDetailStatus");

  const config: Record<BorrowDetailStatus, { label: string; style: string }> = {
    borrowed: {
      label: t("borrowed"),
      style:
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/60 dark:text-orange-300 dark:border-orange-800",
    },
    returned: {
      label: t("returned"),
      style:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/60 dark:text-green-300 dark:border-green-800",
    },
    lost: {
      label: t("lost"),
      style:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/60 dark:text-red-300 dark:border-red-800",
    },
  };

  const { label, style } = config[status] ?? config.borrowed;

  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {label}
    </Badge>
  );
}
