"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  onClick: () => void;
  loading?: boolean;
  label: string;
  className?: string;
  disabled?: boolean;
}

export default function ExportButton({
  onClick,
  loading = false,
  label,
  className,
  disabled,
}: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn("h-8 gap-1.5 border-slate-200 rounded-lg", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <Download className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
      {label}
    </Button>
  );
}
