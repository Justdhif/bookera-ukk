"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import Link from "next/link";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow, BorrowFilterParams } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Search, ClipboardList } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { BorrowCard } from "./BorrowCard";
import { BorrowRequestCard } from "./BorrowRequestCard";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { getCurrentMonthRange } from "@/lib/month-range";
import { downloadBlobFile } from "@/lib/download";
import { Download } from "lucide-react";

export default function BorrowClient() {
  const t = useTranslations("borrow");
  const defaultMonthRange = getCurrentMonthRange();
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [borrowFilters, setBorrowFilters] = useState<BorrowFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
    ...defaultMonthRange,
  });
  const [borrowSearch, setBorrowSearch] = useState("");
  const [borrowPagination, setBorrowPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestFilters, setRequestFilters] = useState<{
    search?: string;
    per_page?: number;
    page?: number;
  }>({ per_page: ITEMS_PER_PAGE_OPTIONS[1] });
  const [requestSearch, setRequestSearch] = useState("");
  const [requestPagination, setRequestPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });


  const fetchBorrows = async (activeFilters: BorrowFilterParams) => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getAll(activeFilters);
      const paginatedData = response.data.data;
      setAllBorrows(paginatedData.data ?? paginatedData);
      setBorrowPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
    } finally {
      setLoadingBorrows(false);
    }
  };

  const fetchRequests = async (activeFilters: {
    search?: string;
    per_page?: number;
    page?: number;
  }) => {
    setLoadingRequests(true);
    try {
      const response = await borrowRequestService.getAll(activeFilters);
      const paginatedData = response.data.data;
      setRequests(paginatedData.data ?? paginatedData);
      setRequestPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadRequestsError"));
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setBorrowFilters((prev) => ({
        ...prev,
        search: borrowSearch || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(t);
  }, [borrowSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setRequestFilters((prev) => ({
        ...prev,
        search: requestSearch || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(t);
  }, [requestSearch]);

  const handleBorrowSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setBorrowSearch(e.target.value);
  const handleRequestSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setRequestSearch(e.target.value);

  useEffect(() => {
    fetchBorrows(borrowFilters);
  }, [borrowFilters]);

  useEffect(() => {
    fetchRequests(requestFilters);
  }, [requestFilters]);

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setBorrowFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await borrowService.exportData(borrowFilters);
      downloadBlobFile(
        response.data,
        `borrows_data_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success(t("exportSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("exportError"));
    } finally {
      setExporting(false);
    }
  };



  const renderBorrowCards = (borrows: Borrow[]) => {
    if (borrows.length === 0) {
      return (
        <EmptyState
          icon={<Package />}
          title={t("noBorrowsFound")}
          description={t("noBorrowsFoundDesc")}
        />
      );
    }
    return (
      <div className="grid gap-4">
        {borrows.map((borrow) => (
          <BorrowCard key={borrow.id} borrow={borrow} />
        ))}
      </div>
    );
  };

  const openBorrows = allBorrows.filter((b) => b.status === "open");
  const closedBorrows = allBorrows.filter((b) => b.status === "close");

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("managementTitle")}
        description={t("managementDesc")}
        isAdmin
        rightActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 gap-1 border-slate-200"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-3.5 w-3.5" />
              {t("exportData")}
            </Button>
            <Link href="/admin/borrows/create">
              <Button variant="submit" className="h-8 gap-1">
                <Plus className="h-4 w-4" />
                {t("createBorrow")}
              </Button>
            </Link>
          </div>
        }
      />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            {t("all")} ({allBorrows.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            {t("open")} ({openBorrows.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            {t("closed")} ({closedBorrows.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            {t("requests")} ({requests.length})
          </TabsTrigger>
        </TabsList>

        {[
          {
            value: "all",
            label: t("allBorrows"),
            desc: t("allBorrowsDesc"),
            data: allBorrows,
          },
          {
            value: "open",
            label: t("openBorrows"),
            desc: t("openBorrowsDesc"),
            data: openBorrows,
          },
          {
            value: "closed",
            label: t("closedBorrows"),
            desc: t("closedBorrowsDesc"),
            data: closedBorrows,
          },
        ].map(({ value, label, desc, data }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center mb-6">
                <div className="relative min-w-0 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchByUserOrTitle")}
                    value={borrowSearch}
                    onChange={handleBorrowSearchChange}
                    className="pl-10 h-11! w-full shadow-sm transition-all duration-300"
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
                currentPage={borrowPagination.current_page}
                lastPage={borrowPagination.last_page}
                total={borrowPagination.total}
                from={borrowPagination.from}
                to={borrowPagination.to}
                onPageChange={(page) =>
                  setBorrowFilters((prev) => ({ ...prev, page }))
                }
              >
                {loadingBorrows ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <DataLoading key={i} size="lg" />
                    ))}
                  </div>
                ) : (
                  renderBorrowCards(data)
                )}
              </PaginatedContent>
            </div>
          </TabsContent>
        ))}

        <TabsContent value="requests" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{t("borrowRequests")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("borrowRequestsDesc")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchByNameOrTitle")}
                  value={requestSearch}
                  onChange={handleRequestSearchChange}
                  className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
                />
              </div>
            </div>
            <PaginatedContent
              currentPage={requestPagination.current_page}
              lastPage={requestPagination.last_page}
              total={requestPagination.total}
              from={requestPagination.from}
              to={requestPagination.to}
              onPageChange={(page) =>
                setRequestFilters((prev) => ({ ...prev, page }))
              }
            >
              {loadingRequests ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <DataLoading key={i} size="lg" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList />}
                  title={t("noRequestsFound")}
                  description={t("noRequestsFoundDesc")}
                />
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <BorrowRequestCard
                      key={req.id}
                      req={req}
                    />
                  ))}
                </div>
              )}
            </PaginatedContent>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
