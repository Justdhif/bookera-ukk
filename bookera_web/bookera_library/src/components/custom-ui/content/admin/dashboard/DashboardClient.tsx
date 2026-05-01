"use client";

import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardTotals,
} from "@/types/dashboard";
import TopBorrowedCategoriesChart from "./TopBorrowedCategoriesChart";
import TopBorrowedBooksChart from "./TopBorrowedBooksChart";
import BorrowMonthlyChart from "./BorrowMonthlyChart";
import BorrowCalendar from "./BorrowCalendar";
import { toast } from "sonner";
import DataLoading from "@/components/custom-ui/DataLoading";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { FadeUp, StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import DashboardCards from "./DashboardCards";

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
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("welcome")}
          isAdmin
        />
      </FadeUp>

      <div className="w-full">
        {loading ? (
          <DataLoading size="lg" className="min-h-40" />
        ) : totals ? (
          <DashboardCards data={totals} />
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SlideIn direction="left" delay={0.2}>
          <TopBorrowedCategoriesChart />
        </SlideIn>
        <SlideIn direction="right" delay={0.2}>
          <TopBorrowedBooksChart />
        </SlideIn>
      </div>

      <FadeUp delay={0.4}>
        <BorrowMonthlyChart />
      </FadeUp>
      
      <FadeUp delay={0.6}>
        <BorrowCalendar />
      </FadeUp>
    </StaggerContainer>
  );
}


