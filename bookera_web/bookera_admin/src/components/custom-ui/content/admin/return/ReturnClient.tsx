"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PackageCheck, Search } from "lucide-react";
import ExportButton from "@/components/custom-ui/button/ExportButton";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import EmptyState from "@/components/custom-ui/EmptyState";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { bookReturnService } from "@/services/book-return.service";
import { Borrow } from "@/types/borrow";
import { ReturnFilterParams } from "@/types/book-return";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { toast } from "sonner";
import { ReturnCard } from "./ReturnCard";
import { getCurrentMonthRange } from "@/lib/month-range";
import { downloadBlobFile } from "@/lib/download";
import { StaggerContainer, FadeUp, SlideIn, FadeIn } from "@/components/custom-ui/motion";

export default function ReturnClient() {
  const t = useTranslations("return");
  const tCommon = useTranslations("common");
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReturnFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const fetchAllData = async (activeFilters: ReturnFilterParams) => {
    setLoading(true);

    try {
      const borrowsRes = await bookReturnService.getAll(activeFilters);
      const paginatedData = borrowsRes.data.data;
      const allData: Borrow[] = paginatedData.data ?? paginatedData;
      setAllBorrows(allData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await bookReturnService.exportData(filters);
      downloadBlobFile(
        response.data,
        `returns_data_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success(t("exportSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchAllData(filters);
  }, [filters]);

  const renderBorrowCards = (borrows: Borrow[]) => {
    if (borrows.length === 0) {
      return (
        <EmptyState
          icon={<PackageCheck />}
          title={t("noReturns")}
          description={t("noReturnsDesc")}
        />
      );
    }

    return (
      <StaggerContainer className="grid gap-4">
        {borrows.map((borrow, index) => (
          <ReturnCard key={borrow.id} borrow={borrow} index={index} />
        ))}
      </StaggerContainer>
    );
  };

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("managementTitle")}
          description={t("managementDesc")}
          isAdmin
          rightActions={
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={() => fetchAllData(filters)}
                loading={loading}
              />
              <ExportButton
                onClick={handleExport}
                loading={exporting}
              />
            </div>
          }
        />
      </FadeUp>

      <div className="space-y-4">


        <FadeUp delay={0.2}>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center mb-6">
            <div className="relative min-w-0 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchByUserOrTitle")}
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10 h-11! w-full shadow-sm transition-all duration-300"
              />
            </div>
            <DateRangeFilter
              onFilter={handleDateFilter}
              className="w-full lg:w-auto"
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.3}>
          <PaginatedContent
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          >
            {loading ? (
              <FadeIn key="loading">
                <DataLoading size="lg" className="min-h-[400px]" />
              </FadeIn>
            ) : (
              <FadeIn
                key="content"
              >
                {renderBorrowCards(allBorrows)}
              </FadeIn>
            )}
          </PaginatedContent>
        </FadeUp>
      </div>
    </StaggerContainer>
  );
}
