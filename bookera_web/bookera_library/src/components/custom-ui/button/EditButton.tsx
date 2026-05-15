"use client";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";

export interface EditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconOnly?: boolean;
}

export default function EditButton({
  iconOnly = false,
  className,
  ...props
}: EditButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      variant="brand"
      size={iconOnly ? "icon" : "sm"}
      className={cn(
        "h-8 gap-1.5 rounded-lg shrink-0 transition-all duration-300",
        !iconOnly && "px-3",
        className
      )}
      {...props}
    >
      <Edit className="w-3.5 h-3.5" />
      {!iconOnly && <span>{t("edit")}</span>}
    </Button>
  );
}
