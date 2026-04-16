"use client";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardTotals,
} from "@/types/dashboard";
import DashboardCards from "./DashboardCards";
import BorrowMonthlyChart from "./BorrowMonthlyChart";
import BorrowCalendar from "./BorrowCalendar";
import { toast } from "sonner";
import DataLoading from "@/components/custom-ui/DataLoading";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();
  const router = useRouter();
  const [totals, setTotals] = useState<DashboardTotals>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      if (user.role === "officer:catalog") {
        router.replace("/admin/categories");
      } else if (user.role === "officer:management") {
        router.replace("/admin/users");
      }
    }
  }, [user, router]);

  useEffect(() => {
    setLoading(true);
    dashboardService.getTotals()
      .then((res) => {
        setTotals(res.data.data);
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

      {loading ? (
        <DataLoading size="lg" className="border-none bg-transparent shadow-none" />
      ) : (
        <DashboardCards data={totals!} />
      )}

      <BorrowMonthlyChart />
      <BorrowCalendar />
    </div>
  );
}
