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

type DateMode = "all" | "future" | "past";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  dateMode?: DateMode;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  dateMode = "all",
  minDate,
  maxDate,
}: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) => {
            if (effectiveMinDate && date < effectiveMinDate) return true;
            if (effectiveMaxDate && date > effectiveMaxDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
