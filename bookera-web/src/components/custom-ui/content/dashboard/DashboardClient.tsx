"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardTotals,
  LoanMonthly,
  LoanStatus,
  DashboardLatest,
} from "@/types/dashboard";
import DashboardCards from "./cards/DashboardCards";
import LoanMonthlyChart from "./charts/LoanMonthlyChart";
import LoanStatusChart from "./charts/LoanStatusChart";
import LatestData from "./latest/LatestData";
import { toast } from "sonner";

export default function DashboardClient() {
  const [totals, setTotals] = useState<DashboardTotals>();
  const [monthly, setMonthly] = useState<LoanMonthly[]>([]);
  const [status, setStatus] = useState<LoanStatus[]>([]);
  const [latest, setLatest] = useState<DashboardLatest>();

  useEffect(() => {
    Promise.all([
      dashboardService.totals(),
      dashboardService.loanMonthlyChart(),
      dashboardService.loanStatusChart(),
      dashboardService.latest(),
    ])
      .then(([totalsRes, monthlyRes, statusRes, latestRes]) => {
        setTotals(totalsRes.data.data);
        setMonthly(monthlyRes.data.data);
        setStatus(statusRes.data.data);
        setLatest(latestRes.data.data);
      })
      .catch(() => {
        toast.error("Gagal memuat dashboard");
      });
  }, []);

  if (!totals) return null;

  return (
    <div className="space-y-6">
      <DashboardCards data={totals} />

      <div className="grid gap-6 md:grid-cols-2">
        <LoanMonthlyChart data={monthly} />
        <LoanStatusChart data={status} />
      </div>

      <LatestData data={latest} />
    </div>
  );
}
