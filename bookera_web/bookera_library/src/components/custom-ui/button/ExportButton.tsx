"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ExportButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function ExportButton({
  onClick,
  loading = false,
  className,
  disabled,
}: ExportButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      variant="outline"
      className={cn("h-8 gap-1.5 border-slate-200 rounded-lg", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <Download className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
      {t("export")}
    </Button>
  );
}
