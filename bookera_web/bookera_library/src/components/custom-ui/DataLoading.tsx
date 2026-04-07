import { Loader2 } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type DataLoadingProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "card" | "inline";
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<
  NonNullable<DataLoadingProps["size"]>,
  { spinner: string; card: string }
> = {
  sm: { spinner: "h-4 w-4", card: "min-h-56 px-4 py-8" },
  md: { spinner: "h-6 w-6", card: "min-h-70 px-6 py-10" },
  lg: { spinner: "h-8 w-8", card: "min-h-96 px-8 py-12" },
};

export default function DataLoading({
  variant = "card",
  size = "md",
  className,
  ...props
}: DataLoadingProps) {
  if (variant === "inline") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading"
        className={cn(
          "inline-flex items-center justify-center text-muted-foreground",
          className,
        )}
        {...props}
      >
        <Loader2
          className={cn(
            "animate-spin text-brand-primary",
            sizeClasses[size].spinner,
          )}
        />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn(
        "flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-linear-to-br from-brand-primary/5 via-background to-muted/30 text-center shadow-sm",
        sizeClasses[size].card,
        className,
      )}
      {...props}
    >
      <div className="rounded-full bg-brand-primary/10 p-3">
        <Loader2
          className={cn(
            "animate-spin text-brand-primary",
            sizeClasses[size].spinner,
          )}
        />
      </div>
    </div>
  );
}