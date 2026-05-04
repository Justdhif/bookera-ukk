"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImportButtonProps {
  onClick: () => void;
  loading?: boolean;
  label: string;
  className?: string;
  disabled?: boolean;
}

export default function ImportButton({
  onClick,
  loading = false,
  label,
  className,
  disabled,
}: ImportButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn("h-8 gap-1.5 border-slate-200 rounded-lg", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <FileSpreadsheet className={cn("w-3.5 h-3.5", loading && "animate-pulse")} />
      {label}
    </Button>
  );
}
