import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DashboardTotals,
  BorrowMonthly,
  BorrowStatus,
  LatestBorrow,
} from "@/types/dashboard";

export const dashboardService = {
  getTotals: () => api.get<ApiResponse<DashboardTotals>>("/admin/dashboard/totals"),

  getLoanMonthlyChart: () =>
    api.get<ApiResponse<BorrowMonthly[]>>("/admin/dashboard/loan-monthly-chart"),

  getLoanStatusChart: () =>
    api.get<ApiResponse<BorrowStatus[]>>("/admin/dashboard/loan-status-chart"),

  getLatestBorrows: () =>
    api.get<ApiResponse<LatestBorrow[]>>("/admin/dashboard/latest"),
};
