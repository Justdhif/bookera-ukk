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
import ActivityStatistics from "./statistics/ActivityStatistics";
import ActivityCharts from "./charts/ActivityCharts";
import ActivityTable from "./table/ActivityTable";
import ActivityDetailDialog from "./dialog/ActivityDetailDialog";
import { ActivityStatisticsSkeleton } from "./statistics/ActivityStatisticsSkeleton";
import { ActivityChartsSkeleton } from "./charts/ActivityChartsSkeleton";
import { ActivityTableSkeleton } from "./table/ActivityTableSkeleton";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";

export default function ActivityLogClient() {
  const t = useTranslations("activity-log");
  const [data, setData] = useState<ActivityLogIndexResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ActivityLogFilters>({
    page: 1,
    per_page: 15,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchActivityLogs();
  }, [filters]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogService.getAll(filters, true);
      setData(response.data.data);
    } catch (error) {
      toast.error("loadError");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-8">
      <ContentHeader
        title={t("title")}
        description={t("description")}
        isAdmin
      />

      {loading ? (
        <ActivityStatisticsSkeleton />
      ) : (
        data && <ActivityStatistics statistics={data.statistics} />
      )}

      {loading ? (
        <ActivityChartsSkeleton />
      ) : (
        data && (
          <ActivityCharts
            charts={data.charts}
            onYearChange={handleYearChange}
          />
        )
      )}

      {loading ? (
        <ActivityTableSkeleton />
      ) : (
        data && (
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
        )
      )}

      <ActivityDetailDialog
        activityId={selectedId}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
