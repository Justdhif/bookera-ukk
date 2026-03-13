"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FineStatus = "unpaid" | "paid" | "waived";

interface FineStatusBadgeProps {
  status: FineStatus;
  className?: string;
}

export default function FineStatusBadge({
  status,
  className,
}: FineStatusBadgeProps) {
  const t = useTranslations("fineStatus");

  const config: Record<FineStatus, { label: string; style: string }> = {
    unpaid: {
      label: t("unpaid"),
      style:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/60 dark:text-red-300 dark:border-red-800",
    },
    paid: {
      label: t("paid"),
      style:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/60 dark:text-green-300 dark:border-green-800",
    },
    waived: {
      label: t("waived"),
      style:
        "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700",
    },
  };

  const { label, style } = config[status] ?? config.unpaid;

  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {label}
    </Badge>
  );
}
