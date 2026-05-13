"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";

type DateMode = "all" | "future" | "past";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  dateMode?: DateMode;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  dateMode = "all",
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const t = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const effectivePlaceholder = placeholder || t("selectDatePlaceholder");

  const effectiveMinDate = React.useMemo(() => {
    if (minDate) return minDate;
    if (dateMode === "future") return today;
    return undefined;
  }, [minDate, dateMode, today]);

  const effectiveMaxDate = React.useMemo(() => {
    if (maxDate) return maxDate;
    if (dateMode === "past") return today;
    return undefined;
  }, [maxDate, dateMode, today]);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false); // Close popover after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent/50 hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-50",
            className,
            !value && "text-muted-foreground",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-50" />
          {value ? format(value, "PPP") : <span>{effectivePlaceholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto overflow-hidden rounded-3xl border-border/60 bg-popover p-0 shadow-2xl shadow-black/10"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={(date) => {
            if (effectiveMinDate && date < effectiveMinDate) return true;
            if (effectiveMaxDate && date > effectiveMaxDate) return true;
            return false;
          }}
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear() + 10}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
