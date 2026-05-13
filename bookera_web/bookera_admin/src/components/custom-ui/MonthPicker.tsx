"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, setMonth, setYear, startOfMonth } from "date-fns";

interface MonthPickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function MonthPicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}: MonthPickerProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value ? value.getFullYear() : new Date().getFullYear());

  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleMonthSelect = (month: number) => {
    const newDate = startOfMonth(setYear(setMonth(new Date(), month), viewYear));
    onChange(newDate);
    setOpen(false);
  };

  const incrementYear = () => setViewYear((prev) => prev + 1);
  const decrementYear = () => setViewYear((prev) => prev - 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-50" />
            {value ? format(value, "MMMM yyyy") : placeholder || t("selectMonth")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={decrementYear}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-bold">{viewYear}</div>
          <Button variant="outline" size="icon" onClick={incrementYear}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => {
            const isSelected = value && value.getMonth() === month && value.getFullYear() === viewYear;
            return (
              <Button
                key={month}
                variant={isSelected ? "default" : "outline"}
                className="h-9 w-full"
                onClick={() => handleMonthSelect(month)}
              >
                {format(setMonth(new Date(), month), "MMM")}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
