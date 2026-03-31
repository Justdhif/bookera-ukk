"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
type Condition = "good" | "damaged" | "lost";
interface ConditionBadgeProps {
  condition: Condition;
  className?: string;
}
export default function ConditionBadge({
  condition,
  className,
}: ConditionBadgeProps) {
  const t = useTranslations("condition");
  const config: Record<Condition, { label: string; style: string }> = {
    good: {
      label: t("good"),
      style:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/60 dark:text-green-300 dark:border-green-800",
    },
    damaged: {
      label: t("damaged"),
      style:
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-300 dark:border-yellow-800",
    },
    lost: {
      label: t("lost"),
      style:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/60 dark:text-red-300 dark:border-red-800",
    },
  };
  const { label, style } = config[condition] ?? config.good;
  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {label}
    </Badge>
  );
}
