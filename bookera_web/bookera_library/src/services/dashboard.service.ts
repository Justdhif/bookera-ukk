import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DashboardTotals,
  BorrowMonthly,
  BorrowStatus,
  CalendarDay,
  BorrowComparison,
  DayDetail,
  LoginRegisterTrend,
} from "@/types/dashboard";

export const dashboardService = {
  getTotals: () =>
    api.get<ApiResponse<DashboardTotals>>("/admin/dashboard/totals"),

  getLoanMonthlyChart: (year: number) =>
    api.get<ApiResponse<BorrowMonthly[]>>(
      `/admin/dashboard/loan-monthly-chart?year=${year}`,
    ),

  getLoanStatusChart: (year: number, month: number) =>
    api.get<ApiResponse<BorrowStatus[]>>(`/admin/dashboard/loan-status-chart?year=${year}&month=${month}`),

  getCalendar: (year: number, month: number) =>
    api.get<ApiResponse<CalendarDay[]>>(`/admin/dashboard/calendar?year=${year}&month=${month}`),

  getDayDetail: (year: number, month: number, day: number) =>
    api.get<ApiResponse<DayDetail>>(`/admin/dashboard/day-detail?year=${year}&month=${month}&day=${day}`),

  getBorrowComparisonChart: (year: number) =>
    api.get<ApiResponse<BorrowComparison[]>>(`/admin/dashboard/borrow-comparison-chart?year=${year}`),

  getLoginRegisterTrendChart: (year: number) =>
    api.get<ApiResponse<LoginRegisterTrend[]>>(
      `/admin/dashboard/login-register-trend-chart?year=${year}`,
    ),
};
