import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DashboardTotals,
  LoanMonthly,
  LoanStatus,
  LatestLoan,
} from "@/types/dashboard";

export const dashboardService = {
  totals: () => api.get<ApiResponse<DashboardTotals>>("/admin/dashboard/totals"),

  loanMonthlyChart: () =>
    api.get<ApiResponse<LoanMonthly[]>>("/admin/dashboard/loan-monthly-chart"),

  loanStatusChart: () =>
    api.get<ApiResponse<LoanStatus[]>>("/admin/dashboard/loan-status-chart"),

  latestLoans: () =>
    api.get<ApiResponse<LatestLoan[]>>("/admin/dashboard/latest"),
};
