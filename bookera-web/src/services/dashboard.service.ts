import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DashboardTotals,
  BorrowMonthly,
  BorrowStatus,
  LatestBorrow,
} from "@/types/dashboard";

export const dashboardService = {
  totals: () => api.get<ApiResponse<DashboardTotals>>("/admin/dashboard/totals"),

  loanMonthlyChart: () =>
    api.get<ApiResponse<BorrowMonthly[]>>("/admin/dashboard/loan-monthly-chart"),

  loanStatusChart: () =>
    api.get<ApiResponse<BorrowStatus[]>>("/admin/dashboard/loan-status-chart"),

  latestBorrows: () =>
    api.get<ApiResponse<LatestBorrow[]>>("/admin/dashboard/latest"),
};
