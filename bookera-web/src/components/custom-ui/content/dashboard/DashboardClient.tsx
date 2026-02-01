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
import { toast } from "sonner";

export default function DashboardClient() {
  const [totals, setTotals] = useState<DashboardTotals>();
  const [monthly, setMonthly] = useState<LoanMonthly[]>([]);
  const [status, setStatus] = useState<LoanStatus[]>([]);
  const [latestLoans, setLatestLoans] = useState<LatestLoan[]>([]);

  useEffect(() => {
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
      });
  }, []);

  if (!totals) return null;

  return (
    <div className="space-y-6">
      <DashboardCards data={totals} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LoanStatusChart data={status} />
        <LatestLoansTable data={latestLoans} />
      </div>

      <LoanMonthlyChart data={monthly} />
    </div>
  );
}
