"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  /** Primary button — triggers a callback */
  actionLabel?: string;
  onAction?: () => void;
  /** Secondary link — renders as a Next.js <Link> */
  linkLabel?: string;
  linkHref?: string;
  /**
   * "default"  → full-height card with dashed border (page-level)
   * "compact"  → smaller padding, no border (inside panels / dropdowns)
   */
  variant?: "default" | "compact";
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  linkLabel,
  linkHref,
  variant = "default",
  className,
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact
          ? "py-8 px-4 gap-2"
          : "rounded-xl border border-dashed p-10 h-[70vh] gap-1",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl text-brand-primary",
            isCompact
              ? "mb-2 h-12 w-12 bg-brand-primary/10 dark:bg-brand-primary/15 ring-1 ring-brand-primary/20"
              : "mb-4 h-16 w-16 bg-brand-primary/10 dark:bg-brand-primary/15 ring-1 ring-brand-primary/20",
          )}
        >
          {icon}
        </div>
      )}

      {title && (
        <h3
          className={cn(
            "font-semibold text-foreground",
            isCompact ? "text-sm" : "text-lg",
          )}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            isCompact ? "text-xs" : "text-sm mt-0.5 max-w-xs",
          )}
        >
          {description}
        </p>
      )}

      {(actionLabel && onAction) || (linkLabel && linkHref) ? (
        <div className={cn("flex gap-2", isCompact ? "mt-3" : "mt-5")}>
          {linkLabel && linkHref && (
            <Link
              href={linkHref}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition-colors",
                "bg-brand-primary hover:bg-brand-primary-dark text-white shadow-brand-primary/20",
                isCompact ? "h-8 px-5 text-xs" : "h-10 px-6 text-sm",
              )}
            >
              {linkLabel}
            </Link>
          )}
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="brand"
              size={isCompact ? "sm" : "default"}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
