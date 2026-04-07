"use client";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
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
import { toast } from "sonner";
import DataLoading from "@/components/custom-ui/DataLoading";

export default function DashboardClient() {
  const t = useTranslations("dashboard");
  const [totals, setTotals] = useState<DashboardTotals>();
  const [monthly, setMonthly] = useState<BorrowMonthly[]>([]);
  const [status, setStatus] = useState<BorrowStatus[]>([]);
  const [latestBorrows, setLatestBorrows] = useState<LatestBorrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardService.getTotals(),
      dashboardService.getLoanMonthlyChart(),
      dashboardService.getLoanStatusChart(),
      dashboardService.getLatestBorrows(),
    ])
      .then(([totalsRes, monthlyRes, statusRes, latestRes]) => {
        setTotals(totalsRes.data.data);
        setMonthly(monthlyRes.data.data);
        setStatus(statusRes.data.data);
        setLatestBorrows(latestRes.data.data);
      })
      .catch(() => {
        toast.error(t("loadError"));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("welcome")}
        isAdmin
      />
      {loading ? <DataLoading size="lg" /> : <DashboardCards data={totals!} />}
      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? <DataLoading size="lg" /> : <BorrowStatusChart data={status} />}
        {loading ? <DataLoading size="lg" /> : <LatestBorrowsTable data={latestBorrows} />}
      </div>
      {loading ? <DataLoading size="lg" /> : <BorrowMonthlyChart data={monthly} />}
    </div>
  );
}
