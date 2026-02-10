"use client";

import { useEffect, useState } from "react";
import { activityLogService } from "@/services/activity-log.service";
import { ActivityLogIndexResponse, ActivityLogFilters } from "@/types/activity-log";
import { toast } from "sonner";
import ActivityStatistics from "./statistics/ActivityStatistics";
import ActivityCharts from "./charts/ActivityCharts";
import ActivityTable from "./table/ActivityTable";
import ActivityDetailDialog from "./dialog/ActivityDetailDialog";
import { ActivityStatisticsSkeleton } from "./statistics/ActivityStatisticsSkeleton";
import { ActivityChartsSkeleton } from "./charts/ActivityChartsSkeleton";
import { ActivityTableSkeleton } from "./table/ActivityTableSkeleton";
import { useTranslations } from "next-intl";

export default function ActivityLogClient() {
  const t = useTranslations('admin.activityLogs');
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
      const response = await activityLogService.getAll(filters);
      setData(response.data.data);
    } catch (error) {
      toast.error(t('loadError'));
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
        </div>
      </div>

      {loading ? (
        <ActivityStatisticsSkeleton />
      ) : (
        data && <ActivityStatistics statistics={data.statistics} />
      )}

      {loading ? (
        <ActivityChartsSkeleton />
      ) : (
        data && <ActivityCharts charts={data.charts} onYearChange={handleYearChange} />
      )}

      {loading ? (
        <ActivityTableSkeleton />
      ) : (
        data && (
          <ActivityTable
            logs={data.logs.data}
            pagination={data.logs}
            onRowClick={handleRowClick}
            onPageChange={handlePageChange}
            filters={filters}
            onFilterChange={setFilters}
          />
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
