"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MonthPicker from "./MonthPicker";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { X, Filter } from "lucide-react";

interface MonthRangeFilterProps {
  onFilter: (startDate?: string, endDate?: string) => void;
  className?: string;
}

export default function MonthRangeFilter({
  onFilter,
  className,
}: MonthRangeFilterProps) {
  const t = useTranslations("borrow");
  const [startMonth, setStartMonth] = useState<Date | undefined>();
  const [endMonth, setEndMonth] = useState<Date | undefined>();

  const handleApply = () => {
    const startStr = startMonth ? format(startOfMonth(startMonth), "yyyy-MM-dd") : undefined;
    const endStr = endMonth ? format(endOfMonth(endMonth), "yyyy-MM-dd") : undefined;
    onFilter(startStr, endStr);
  };

  const handleClear = () => {
    setStartMonth(undefined);
    setEndMonth(undefined);
    onFilter(undefined, undefined);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-end gap-3 ${className}`}>
      <div className="grid gap-1.5 w-full sm:w-48">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t("startMonth")}
        </label>
        <MonthPicker
          value={startMonth}
          onChange={setStartMonth}
          placeholder={t("selectStartMonth")}
        />
      </div>
      <div className="grid gap-1.5 w-full sm:w-48">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t("endMonth")}
        </label>
        <MonthPicker
          value={endMonth}
          onChange={setEndMonth}
          placeholder={t("selectEndMonth")}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button 
          variant="submit" 
          onClick={handleApply}
          className="flex-1 sm:flex-none"
        >
          <Filter className="h-4 w-4 mr-2" />
          {t("filter")}
        </Button>
        {(startMonth || endMonth) && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleClear}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
