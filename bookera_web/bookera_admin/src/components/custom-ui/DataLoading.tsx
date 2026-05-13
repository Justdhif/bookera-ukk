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
  sm: { spinner: "size-6", card: "min-h-56 px-4 py-8" },
  md: { spinner: "size-8", card: "min-h-70 px-6 py-10" },
  lg: { spinner: "size-12", card: "min-h-96 px-8 py-12" },
};

function LoadingSpinner({ size }: { size: NonNullable<DataLoadingProps["size"]> }) {
  return (
    <div className="flex items-end justify-center space-x-1">
      <svg
        className={cn(
          "animate-spin animation-duration-[2s] text-lime-600 dark:text-lime-500",
          sizeClasses[size].spinner,
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M12 2a3 3 0 0 1 3 3c0 .562 -.259 1.442 -.776 2.64l-.724 1.36l1.76 -1.893c.499 -.6 .922 -1 1.27 -1.205a2.968 2.968 0 0 1 4.07 1.099a3.011 3.011 0 0 1 -1.09 4.098c-.374 .217 -.99 .396 -1.846 .535l-2.664 .366l2.4 .326c1 .145 1.698 .337 2.11 .576a3.011 3.011 0 0 1 1.09 4.098a2.968 2.968 0 0 1 -4.07 1.098c-.348 -.202 -.771 -.604 -1.27 -1.205l-1.76 -1.893l.724 1.36c.516 1.199 .776 2.079 .776 2.64a3 3 0 0 1 -6 0c0 -.562 .259 -1.442 .776 -2.64l.724 -1.36l-1.76 1.893c-.499 .601 -.922 1 -1.27 1.205a2.968 2.968 0 0 1 -4.07 -1.098a3.011 3.011 0 0 1 1.09 -4.098c.374 -.218 .99 -.396 1.846 -.536l2.664 -.366l-2.4 -.325c-1 -.145 -1.698 -.337 -2.11 -.576a3.011 3.011 0 0 1 -1.09 -4.099a2.968 2.968 0 0 1 4.07 -1.099c.348 .203 .771 .604 1.27 1.205l1.76 1.894c-1 -2.292 -1.5 -3.625 -1.5 -4a3 3 0 0 1 3 -3" />
      </svg>
    </div>
  );
}

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
        <LoadingSpinner size={size} />
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
      <LoadingSpinner size={size} />
    </div>
  );
}
