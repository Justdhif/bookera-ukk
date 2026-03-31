"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
type BorrowStatus = "open" | "close";
interface BorrowStatusBadgeProps {
  status: BorrowStatus;
  className?: string;
}
export default function BorrowStatusBadge({
  status,
  className,
}: BorrowStatusBadgeProps) {
  const t = useTranslations("borrowStatus");
  const config: Record<BorrowStatus, { label: string; style: string }> = {
    open: {
      label: t("open"),
      style:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/60 dark:text-green-300 dark:border-green-800",
    },
    close: {
      label: t("close"),
      style:
        "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700",
    },
  };
  const { label, style } = config[status] ?? config.close;
  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {label}
    </Badge>
  );
}
