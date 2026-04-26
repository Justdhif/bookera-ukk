"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DatePicker from "./DatePicker";
import { format, startOfDay, endOfDay } from "date-fns";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onFilter: (startDate?: string, endDate?: string) => void;
  className?: string;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export default function DateRangeFilter({
  onFilter,
  className,
  defaultStartDate,
  defaultEndDate,
}: DateRangeFilterProps) {
  const t = useTranslations("borrow");
  const [startDate, setStartDate] = useState<Date | undefined>(
    defaultStartDate ? new Date(`${defaultStartDate}T00:00:00`) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    defaultEndDate ? new Date(`${defaultEndDate}T00:00:00`) : undefined,
  );

  // Real-time filtering
  useEffect(() => {
    const startStr = startDate ? format(startOfDay(startDate), "yyyy-MM-dd") : undefined;
    const endStr = endDate ? format(endOfDay(endDate), "yyyy-MM-dd") : undefined;
    onFilter(startStr, endStr);
  }, [startDate, endDate]);

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Reset end date if it's before start date
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setEndDate(undefined);
    }
  }, [startDate]);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-2", className)}>
      <div className="w-full sm:w-44">
        <DatePicker
          value={startDate}
          onChange={setStartDate}
          placeholder={t("selectStartDate")}
        />
      </div>
      <div className="hidden sm:block text-muted-foreground font-bold">
        -
      </div>
      <div className="w-full sm:w-44">
        <DatePicker
          value={endDate}
          onChange={setEndDate}
          placeholder={t("selectEndDate")}
          minDate={startDate}
        />
      </div>
      <Button 
        variant="outline" 
        onClick={handleClear}
        size="icon"
        disabled={!startDate && !endDate}
        className="h-11 w-11 shrink-0 border-input hover:bg-secondary transition-all duration-300"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
