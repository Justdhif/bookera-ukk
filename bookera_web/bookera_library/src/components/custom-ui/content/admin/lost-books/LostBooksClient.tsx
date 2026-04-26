"use client";

import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { LostBook, LostBookFilterParams } from "@/types/lost-book";
import { lostBookService } from "@/services/lost-book.service";
import { LostBookCard } from "./LostBookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { Download, Search, AlertCircle } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import EmptyState from "@/components/custom-ui/EmptyState";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { getCurrentMonthRange } from "@/lib/month-range";
import { downloadBlobFile } from "@/lib/download";

export default function LostBooksClient() {
  const t = useTranslations("lost-books");
  const defaultMonthRange = getCurrentMonthRange();
  const [lostBooks, setLostBooks] = useState<LostBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filters, setFilters] = useState<LostBookFilterParams>({
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

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));
  };

  const fetchLostBooks = async (activeFilters: LostBookFilterParams) => {
    setLoading(true);
    try {
      const res = await lostBookService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setLostBooks(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page,
        last_page: paginatedData.last_page,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
      });
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await lostBookService.exportData(filters);
      downloadBlobFile(
        response.data,
        `lost-books_data_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success(t("exportSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchLostBooks(filters);
  }, [filters]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await lostBookService.delete(deleteId);
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchLostBooks(filters);
    } catch (error: any) {
      toast.error(t("deleteError"));
    }
  };



  const renderCards = (books: LostBook[]) => {
    if (books.length === 0) {
      return (
        <EmptyState
          icon={<AlertCircle />}
          title={t("noLostBooks")}
          description={t("noLostBooksDesc")}
        />
      );
    }
    return (
      <div className="grid gap-4">
        {books.map((lostBook) => (
          <LostBookCard
            key={lostBook.borrow_id}
            borrow={lostBook.borrow}
            items={[lostBook]}
            onDelete={(id) => setDeleteId(id)}
            actionLoading={actionLoading}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("description")}
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

      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center mb-6">
          <div className="relative min-w-0 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
          <DateRangeFilter
            onFilter={handleDateFilter}
            defaultStartDate={defaultMonthRange.startDate}
            defaultEndDate={defaultMonthRange.endDate}
            className="w-full lg:w-auto"
          />
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
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <DataLoading key={i} size="lg" />
              ))}
            </div>
          ) : (
            renderCards(lostBooks)
          )}
        </PaginatedContent>
      </div>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteLostBookRecord")}
        description={t("deleteLostDesc")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
