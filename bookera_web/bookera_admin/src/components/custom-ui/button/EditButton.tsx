"use client";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

export interface EditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  iconOnly?: boolean;
}

export default function EditButton({
  label,
  iconOnly = false,
  className,
  ...props
}: EditButtonProps) {
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
      {!iconOnly && label && <span>{label}</span>}
    </Button>
  );
}
