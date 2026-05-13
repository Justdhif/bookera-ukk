import { endOfMonth, format, startOfMonth } from "date-fns";

export interface MonthRange {
  startDate: string;
  endDate: string;
}

export function getCurrentMonthRange(referenceDate = new Date()): MonthRange {
  return {
    startDate: format(startOfMonth(referenceDate), "yyyy-MM-dd"),
    endDate: format(endOfMonth(referenceDate), "yyyy-MM-dd"),
  };
}
