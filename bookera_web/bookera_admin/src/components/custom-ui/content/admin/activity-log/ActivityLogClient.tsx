"use client";

import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useEffect, useState } from "react";
import { activityLogService } from "@/services/activity-log.service";
import {
  ActivityLogIndexResponse,
  ActivityLogFilters,
} from "@/types/activity-log";
import { toast } from "sonner";
import ActivityStatistics from "./ActivityStatistics";
import ActivityCharts from "./ActivityCharts";
import ActivityTable from "./ActivityTable";
import ActivityFilters from "./ActivityFilters";
import ActivityDetailDialog from "./ActivityDetailDialog";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function ActivityLogClient() {
  const t = useTranslations("activity-log");
  const { user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<ActivityLogIndexResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      if (user.role === "officer:catalog") {
        router.replace("/categories");
      } else if (user.role === "officer:management") {
        router.replace("/users");
      } else {
        router.replace("/home");
      }
    }
  }, [user, router]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ActivityLogFilters>({
    page: 1,
    per_page: 15,
    year: new Date().getFullYear(),
  });

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogService.getAll(filters, true);
      setData(response.data.data);
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [filters]);

  const handleRowClick = (id: number) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleYearChange = (year: number) => {
    setFilters({ ...filters, year, page: 1 });
  };

  return (
    <StaggerContainer className="space-y-8">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("description")}
          isAdmin
        />
      </FadeUp>

      {loading ? (
        <FadeIn key="loading-stats">
          <DataLoading size="lg" />
        </FadeIn>
      ) : (
        data && (
          <FadeUp delay={0.1}>
            <ActivityStatistics statistics={data.statistics} />
          </FadeUp>
        )
      )}

      {loading ? (
        <FadeIn key="loading-charts">
          <DataLoading size="lg" />
        </FadeIn>
      ) : (
        data && (
          <FadeUp delay={0.2}>
            <ActivityCharts
              charts={data.charts}
              onYearChange={handleYearChange}
            />
          </FadeUp>
        )
      )}

      <FadeUp delay={0.3}>
        <ActivityFilters filters={filters} onFilterChange={setFilters} />
      </FadeUp>

      {loading ? (
        <FadeIn key="loading-table">
          <div className="flex justify-center py-12">
            <DataLoading variant="inline" size="lg" />
          </div>
        </FadeIn>
      ) : (
        data && (
          <FadeIn key="content-table">
            <div className="space-y-4">
              <PaginatedContent
                currentPage={data.logs.current_page}
                lastPage={data.logs.last_page}
                total={data.logs.total}
                from={data.logs.from}
                to={data.logs.to}
                onPageChange={handlePageChange}
              >
                <ActivityTable
                  logs={data.logs.data}
                  pagination={data.logs}
                  onRowClick={handleRowClick}
                  onPageChange={handlePageChange}
                  filters={filters}
                  onFilterChange={setFilters}
                />
              </PaginatedContent>
            </div>
          </FadeIn>
        )
      )}

      <ActivityDetailDialog
        activityId={selectedId}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </StaggerContainer>
  );
}
