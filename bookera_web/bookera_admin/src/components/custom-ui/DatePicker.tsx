"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, Check, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, setMonth, setYear, startOfMonth, getDaysInMonth, isBefore, isSameDay, startOfDay } from "date-fns";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  minDate,
}: DatePickerProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"year" | "month" | "day">("day");
  const [viewYear, setViewYear] = useState(value ? value.getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth() : new Date().getMonth());

  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [value]);

  const months = Array.from({ length: 12 }, (_, i) => i);
  const years = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - 50 + i);

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setStep("month");
  };

  const handleMonthSelect = (month: number) => {
    setViewMonth(month);
    setStep("day");
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    onChange(newDate);
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(new Date(viewYear, viewMonth));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const incrementMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const decrementMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const isDayDisabled = (day: number) => {
    if (!minDate) return false;
    const date = new Date(viewYear, viewMonth, day);
    return isBefore(startOfDay(date), startOfDay(minDate));
  };

  const isMonthDisabled = (month: number) => {
    if (!minDate) return false;
    const lastDayOfMonth = new Date(viewYear, month + 1, 0);
    return isBefore(startOfDay(lastDayOfMonth), startOfDay(minDate));
  };

  const isYearDisabled = (year: number) => {
    if (!minDate) return false;
    const lastDayOfYear = new Date(year, 11, 31);
    return isBefore(startOfDay(lastDayOfYear), startOfDay(minDate));
  };

  return (
    <Popover open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o) setStep("day");
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-11 border-input shadow-sm transition-all duration-300 hover:border-brand-primary",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 opacity-50 text-brand-primary" />
            {value ? format(value, "dd MMM yyyy") : placeholder || t("selectDate")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        {step === "year" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-bold text-lg text-brand-primary">
              <span>{t("selectYear")}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
              {years.map((year) => (
                <Button
                  key={year}
                  variant={viewYear === year ? "brand" : "outline"}
                  size="sm"
                  className={cn("h-9", viewYear === year && "bg-brand-primary text-white hover:bg-brand-primary-dark")}
                  onClick={() => handleYearSelect(year)}
                  disabled={isYearDisabled(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === "month" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" className="font-bold text-lg p-0 hover:bg-transparent text-brand-primary" onClick={() => setStep("year")}>
                {viewYear}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month) => {
                const isSelected = value && value.getMonth() === month && value.getFullYear() === viewYear;
                return (
                  <Button
                    key={month}
                    variant={isSelected ? "brand" : "outline"}
                    className={cn("h-10", isSelected && "bg-brand-primary text-white hover:bg-brand-primary-dark")}
                    onClick={() => handleMonthSelect(month)}
                    disabled={isMonthDisabled(month)}
                  >
                    {format(new Date(2000, month, 1), "MMM")}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {step === "day" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="font-bold hover:text-brand-primary px-1 text-brand-primary" onClick={() => setStep("month")}>
                  {format(new Date(2000, viewMonth, 1), "MMMM")}
                </Button>
                <Button variant="ghost" size="sm" className="font-bold hover:text-brand-primary px-1 text-brand-primary" onClick={() => setStep("year")}>
                  {viewYear}
                </Button>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={decrementMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={incrementMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
              {blanks.map((i) => (
                <div key={`blank-${i}`} />
              ))}
              {days.map((day) => {
                const isSelected = value && isSameDay(value, new Date(viewYear, viewMonth, day));
                const isDisabled = isDayDisabled(day);
                return (
                  <Button
                    key={day}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 font-normal",
                      isSelected && "bg-brand-primary! text-white hover:bg-brand-primary-dark!",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isDisabled && handleDaySelect(day)}
                    disabled={isDisabled}
                  >
                    {day}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
