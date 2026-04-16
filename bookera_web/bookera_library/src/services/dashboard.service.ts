import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DashboardTotals,
  BorrowMonthly,
  CalendarDay,
  DayDetail,
} from "@/types/dashboard";

export const dashboardService = {
  getTotals: () =>
    api.get<ApiResponse<DashboardTotals>>("/admin/dashboard/totals"),

  getLoanMonthlyChart: (year: number) =>
    api.get<ApiResponse<BorrowMonthly[]>>(
      `/admin/dashboard/loan-monthly-chart?year=${year}`,
    ),

  getCalendar: (year: number, month: number) =>
    api.get<ApiResponse<CalendarDay[]>>(`/admin/dashboard/calendar?year=${year}&month=${month}`),

  getDayDetail: (year: number, month: number, day: number) =>
    api.get<ApiResponse<DayDetail>>(`/admin/dashboard/day-detail?year=${year}&month=${month}&day=${day}`),
};

