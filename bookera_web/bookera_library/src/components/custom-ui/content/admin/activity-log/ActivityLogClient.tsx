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
import ActivityDetailDialog from "./ActivityDetailDialog";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
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
        router.replace("/admin/categories");
      } else if (user.role === "officer:management") {
        router.replace("/admin/users");
      } else {
        router.replace("/");
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

      {loading ? <DataLoading size="lg" /> : data && <ActivityStatistics statistics={data.statistics} />}

      {loading ? <DataLoading size="lg" /> : data && <ActivityCharts charts={data.charts} onYearChange={handleYearChange} />}

      {loading ? (
        <DataLoading size="lg" />
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
