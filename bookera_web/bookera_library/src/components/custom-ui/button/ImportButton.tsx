"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ImportButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function ImportButton({
  onClick,
  loading = false,
  className,
  disabled,
}: ImportButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      variant="outline"
      className={cn("h-8 gap-1.5 border-slate-200 rounded-lg", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <FileSpreadsheet className={cn("w-3.5 h-3.5", loading && "animate-pulse")} />
      {t("import")}
    </Button>
  );
}
