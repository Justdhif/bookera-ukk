"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function RefreshButton({
  onClick,
  loading = false,
  className,
  disabled,
}: RefreshButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      variant="outline"
      className={cn("h-8 gap-1.5 rounded-lg shrink-0", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
      {t("refresh")}
    </Button>
  );
}
