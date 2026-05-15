"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";

export interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconOnly?: boolean;
}

export default function DeleteButton({
  iconOnly = false,
  className,
  ...props
}: DeleteButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      variant="destructive"
      size={iconOnly ? "icon" : "sm"}
      className={cn(
        "h-8 gap-1.5 rounded-lg shrink-0 transition-all duration-300 shadow-xs hover:shadow-md hover:bg-destructive/90",
        !iconOnly && "px-3",
        className
      )}
      {...props}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {!iconOnly && <span>{t("delete")}</span>}
    </Button>
  );
}
