"use client";

import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { downloadBlobFile } from "@/lib/download";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Fine, FineFilterParams } from "@/types/fine";
import { fineService } from "@/services/fine.service";
import FineTable from "./FineTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { getCurrentMonthRange } from "@/lib/month-range";

export default function FineManagement() {
  const t = useTranslations("fines");
  const defaultMonthRange = getCurrentMonthRange();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<FineFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
    ...defaultMonthRange,
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);

  const statusValue = filters.status ?? "all";
  const handleStatusChange = (value: string) =>
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));

  const handleDateFilter = (start_date?: string, end_date?: string) =>
    setFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));

  const fetchFines = async (activeFilters: FineFilterParams) => {
    setLoading(true);
    try {
      const res = await fineService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setFines(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (err) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fineService.exportData(filters);
      downloadBlobFile(
        response.data,
        `fines_data_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success(t("exportSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchFines(filters);
  }, [filters]);

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("finesTabDescription")}
        isAdmin
        rightActions={
          <Button
            variant="outline"
            className="h-8 gap-1 border-slate-200"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportData")}
          </Button>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center mb-6">
        <div className="relative min-w-0 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchFines")}
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
          />
        </div>
        <DateRangeFilter
          onFilter={handleDateFilter}
          defaultStartDate={defaultMonthRange.startDate}
          defaultEndDate={defaultMonthRange.endDate}
          className="w-full xl:w-auto"
        />
        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full xl:w-44 h-11! shadow-sm transition-all duration-300">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
            <SelectItem value="paid">{t("paid")}</SelectItem>
            <SelectItem value="waived">{t("waived")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PaginatedContent
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      >
        {loading ? (
          <DataLoading size="lg" />
        ) : (
          <FineTable data={fines} />
        )}
      </PaginatedContent>
    </div>
  );
}
