"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  label: string;
  className?: string;
  disabled?: boolean;
}

export default function RefreshButton({
  onClick,
  loading = false,
  label,
  className,
  disabled,
}: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn("h-8 gap-1.5 rounded-lg shrink-0", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
      {label}
    </Button>
  );
}
