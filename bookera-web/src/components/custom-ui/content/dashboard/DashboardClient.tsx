"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardTotals,
  BorrowMonthly,
  BorrowStatus,
  LatestBorrow,
} from "@/types/dashboard";
import DashboardCards from "./cards/DashboardCards";
import BorrowMonthlyChart from "./charts/BorrowMonthlyChart";
import BorrowStatusChart from "./charts/BorrowStatusChart";
import LatestBorrowsTable from "./table/LatestBorrowsTable";
import { DashboardCardsSkeleton } from "./cards/DashboardCardsSkeleton";
import { BorrowMonthlyChartSkeleton, BorrowStatusChartSkeleton } from "./charts/ChartsSkeleton";
import { LatestBorrowsTableSkeleton } from "./table/LatestBorrowsTableSkeleton";
import { toast } from "sonner";
export default function DashboardClient() {
  const [totals, setTotals] = useState<DashboardTotals>();
  const [monthly, setMonthly] = useState<BorrowMonthly[]>([]);
  const [status, setStatus] = useState<BorrowStatus[]>([]);
  const [latestBorrows, setLatestBorrows] = useState<LatestBorrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardService.totals(),
      dashboardService.loanMonthlyChart(),
      dashboardService.loanStatusChart(),
      dashboardService.latestBorrows(),
    ])
      .then(([totalsRes, monthlyRes, statusRes, latestRes]) => {
        setTotals(totalsRes.data.data);
        setMonthly(monthlyRes.data.data);
        setStatus(statusRes.data.data);
        setLatestBorrows(latestRes.data.data);
      })
      .catch(() => {
        toast.error("Failed to load dashboard");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {loading ? <DashboardCardsSkeleton /> : <DashboardCards data={totals!} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? <BorrowStatusChartSkeleton /> : <BorrowStatusChart data={status} />}
        {loading ? <LatestBorrowsTableSkeleton /> : <LatestBorrowsTable data={latestBorrows} />}
      </div>

      {loading ? <BorrowMonthlyChartSkeleton /> : <BorrowMonthlyChart data={monthly} />}
    </div>
  );
}
