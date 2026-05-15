"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";

export interface DetailButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconOnly?: boolean;
}

export default function DetailButton({
  iconOnly = false,
  className,
  ...props
}: DetailButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      variant="outline"
      size={iconOnly ? "icon" : "sm"}
      className={cn(
        "h-8 gap-1.5 rounded-lg shrink-0 transition-all duration-300 hover:bg-muted/50 border-border/60 hover:border-border",
        !iconOnly && "px-3",
        className
      )}
      {...props}
    >
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      {!iconOnly && <span>{t("detail")}</span>}
    </Button>
  );
}
