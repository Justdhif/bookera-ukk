"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardTotals,
  LoanMonthly,
  LoanStatus,
  LatestLoan,
} from "@/types/dashboard";
import DashboardCards from "./cards/DashboardCards";
import LoanMonthlyChart from "./charts/LoanMonthlyChart";
import LoanStatusChart from "./charts/LoanStatusChart";
import LatestLoansTable from "./table/LatestLoansTable";
import { DashboardCardsSkeleton } from "./cards/DashboardCardsSkeleton";
import { LoanMonthlyChartSkeleton, LoanStatusChartSkeleton } from "./charts/ChartsSkeleton";
import { LatestLoansTableSkeleton } from "./table/LatestLoansTableSkeleton";
import { toast } from "sonner";

export default function DashboardClient() {
  const [totals, setTotals] = useState<DashboardTotals>();
  const [monthly, setMonthly] = useState<LoanMonthly[]>([]);
  const [status, setStatus] = useState<LoanStatus[]>([]);
  const [latestLoans, setLatestLoans] = useState<LatestLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardService.totals(),
      dashboardService.loanMonthlyChart(),
      dashboardService.loanStatusChart(),
      dashboardService.latestLoans(),
    ])
      .then(([totalsRes, monthlyRes, statusRes, latestRes]) => {
        setTotals(totalsRes.data.data);
        setMonthly(monthlyRes.data.data);
        setStatus(statusRes.data.data);
        setLatestLoans(latestRes.data.data);
      })
      .catch(() => {
        toast.error("Gagal memuat dashboard");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {loading ? <DashboardCardsSkeleton /> : <DashboardCards data={totals!} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? <LoanStatusChartSkeleton /> : <LoanStatusChart data={status} />}
        {loading ? <LatestLoansTableSkeleton /> : <LatestLoansTable data={latestLoans} />}
      </div>

      {loading ? <LoanMonthlyChartSkeleton /> : <LoanMonthlyChart data={monthly} />}
    </div>
  );
}
