"use client";

import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { downloadBlobFile } from "@/lib/download";
import DataLoading from "@/components/custom-ui/DataLoading";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import EmptyState from "@/components/custom-ui/EmptyState";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { getCurrentMonthRange } from "@/lib/month-range";
import { lostBookService } from "@/services/lost-book.service";
import { LostBook, LostBookFilterParams } from "@/types/lost-book";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Calendar,
  Eye,
  Hash,
  Search,
  Tag,
  User,
} from "lucide-react";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import { toast } from "sonner";

import { StaggerContainer, FadeUp, SlideIn, FadeIn } from "@/components/custom-ui/motion";
import ExportButton from "@/components/custom-ui/button/ExportButton";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";

import { LostBookCard } from "./LostBookCard";

export default function LostBooksClient() {
  const t = useTranslations("lost-books");
  const tCommon = useTranslations("common");
  const [lostBooks, setLostBooks] = useState<LostBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<LostBookFilterParams>({
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
        `lost_books_data_${new Date().toISOString().split("T")[0]}.xlsx`,
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
      <StaggerContainer className="grid gap-4">
        {books.map((lostBook, index) => (
          <LostBookCard
            key={lostBook.id}
            borrow={lostBook.borrow}
            items={[lostBook]}
            index={index}
          />
        ))}
      </StaggerContainer>
    );
  };

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("description")}
          isAdmin
          rightActions={
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={() => fetchLostBooks(filters)}
                loading={loading}
                label={tCommon("refresh")}
              />
              <ExportButton
                onClick={handleExport}
                loading={exporting}
                label={t("exportData")}
              />
            </div>
          }
        />
      </FadeUp>

      <div className="space-y-4">
        <FadeUp delay={0.1}>
          <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative min-w-0 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={handleSearchChange}
                className="h-11! w-full pl-9 shadow-sm transition-all duration-300"
              />
            </div>
            <DateRangeFilter
              onFilter={handleDateFilter}
              className="w-full lg:w-auto"
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
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
              <FadeIn key="content">
                {renderCards(lostBooks)}
              </FadeIn>
            )}
          </PaginatedContent>
        </FadeUp>
      </div>
    </StaggerContainer>
  );
}
