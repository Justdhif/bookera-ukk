"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
type BookCopyStatus = "available" | "borrowed" | "lost" | "damaged";
interface BookCopyStatusBadgeProps {
  status: BookCopyStatus;
  className?: string;
}
export default function BookCopyStatusBadge({
  status,
  className,
}: BookCopyStatusBadgeProps) {
  const t = useTranslations("bookCopyStatus");
  const config: Record<BookCopyStatus, { label: string; style: string }> = {
    available: {
      label: t("available"),
      style:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800",
    },
    borrowed: {
      label: t("borrowed"),
      style:
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/60 dark:text-orange-300 dark:border-orange-800",
    },
    lost: {
      label: t("lost"),
      style:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/60 dark:text-red-300 dark:border-red-800",
    },
    damaged: {
      label: t("damaged"),
      style:
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-300 dark:border-yellow-800",
    },
  };
  const { label, style } = config[status] ?? {
    label: status,
    style: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {label}
    </Badge>
  );
}
