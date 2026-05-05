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
import { StaggerContainer, FadeUp, SlideIn, FadeIn } from "@/components/custom-ui/motion";
import ExportButton from "@/components/custom-ui/button/ExportButton";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";

export default function BorrowClient() {
  const t = useTranslations("borrow");
  const tc = useTranslations("common");
  const monthRange = getCurrentMonthRange();
  const defaultMonthRange = {
    start_date: monthRange.startDate,
    end_date: monthRange.endDate,
  };
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>(defaultMonthRange);

  const [borrowFilters, setBorrowFilters] = useState<BorrowFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
    ...defaultMonthRange,
  });
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
    start_date?: string;
    end_date?: string;
  }>({ 
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
    ...defaultMonthRange 
  });
  const [requestPagination, setRequestPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [activeTab, setActiveTab] = useState("all");


  const fetchBorrows = async (activeFilters: BorrowFilterParams) => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getAll(activeFilters);
      const apiResponse = response.data;
      
      const paginatedData = apiResponse.data;
      const dataArray = Array.isArray(paginatedData) 
        ? paginatedData 
        : (paginatedData?.data || []);

      setAllBorrows(dataArray);
      setBorrowPagination({
        current_page: paginatedData?.current_page ?? 1,
        last_page: paginatedData?.last_page ?? 1,
        total: paginatedData?.total ?? 0,
        from: paginatedData?.from ?? 0,
        to: paginatedData?.to ?? 0,
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
    start_date?: string;
    end_date?: string;
  }) => {
    setLoadingRequests(true);
    try {
      const response = await borrowRequestService.getAll(activeFilters);
      const apiResponse = response.data;
      const paginatedData = apiResponse.data;
      
      const dataArray = Array.isArray(paginatedData) 
        ? paginatedData 
        : (paginatedData?.data || []);

      setRequests(dataArray);
      setRequestPagination({
        current_page: paginatedData?.current_page ?? 1,
        last_page: paginatedData?.last_page ?? 1,
        total: paginatedData?.total ?? 0,
        from: paginatedData?.from ?? 0,
        to: paginatedData?.to ?? 0,
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
        search: search || undefined,
        page: 1,
      }));
      setRequestFilters((prev) => ({
        ...prev,
        search: search || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  useEffect(() => {
    fetchBorrows(borrowFilters);
  }, [borrowFilters]);

  useEffect(() => {
    fetchRequests(requestFilters);
  }, [requestFilters]);

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setDateRange({ start_date, end_date });
    
    setBorrowFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));
    
    setRequestFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
      page: 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let response;
      let fileName = `borrows_data_${new Date().toISOString().split("T")[0]}.xlsx`;

      if (activeTab === "requests") {
        response = await borrowRequestService.exportData({
          search: search || undefined,
          start_date: requestFilters.start_date,
          end_date: requestFilters.end_date,
        });
        fileName = `borrow_requests_data_${new Date().toISOString().split("T")[0]}.xlsx`;
      } else {
        const filters = { ...borrowFilters };
        if (activeTab === "open") filters.status = "open";
        if (activeTab === "closed") filters.status = "close";
        
        response = await borrowService.exportData(filters);
        if (activeTab !== "all") {
          fileName = `${activeTab}_borrows_data_${new Date().toISOString().split("T")[0]}.xlsx`;
        }
      }

      downloadBlobFile(response.data, fileName);
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
      <StaggerContainer className="grid gap-4">
        {borrows.map((borrow, index) => (
          <SlideIn key={borrow.id} direction="up" distance={20} delay={index * 0.05}>
            <BorrowCard borrow={borrow} />
          </SlideIn>
        ))}
      </StaggerContainer>
    );
  };

  const openBorrows = allBorrows.filter((b) => b.status === "open");
  const closedBorrows = allBorrows.filter((b) => b.status === "close");

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
                onClick={() => {
                  fetchBorrows(borrowFilters);
                  fetchRequests(requestFilters);
                }}
                loading={loadingBorrows || loadingRequests}
                label={tc("refresh")}
              />
              <ExportButton
                onClick={handleExport}
                loading={exporting}
                label={t("exportData")}
              />
              <Link href="/admin/borrows/create">
                <Button variant="submit" className="h-8 gap-1">
                  <Plus className="h-4 w-4" />
                  {t("createBorrow")}
                </Button>
              </Link>
            </div>
          }
        />
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "requests" ? t("searchByNameOrTitle") : t("searchByUserOrTitle")}
              value={search}
              onChange={handleSearchChange}
              className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
          <DateRangeFilter
            onFilter={handleDateFilter}
            defaultStartDate={defaultMonthRange.start_date}
            defaultEndDate={defaultMonthRange.end_date}
            className="w-full lg:w-auto"
          />
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
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
                <FadeUp delay={0.1}>
                  <div>
                    <h3 className="text-lg font-semibold">{label}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </FadeUp>
                
                <FadeUp key={value + "-pagination"} delay={0.2}>
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
                      <FadeIn
                        key="loading"
                      >
                        <DataLoading size="lg" />
                      </FadeIn>
                    ) : (
                      <FadeIn
                        key="content"
                      >
                        {renderBorrowCards(data)}
                      </FadeIn>
                    )}
                  </PaginatedContent>
                </FadeUp>
              </div>
            </TabsContent>
          ))}

          <TabsContent value="requests" className="space-y-4">
            <div className="space-y-4">
              <FadeUp delay={0.1}>
                <div>
                  <h3 className="text-lg font-semibold">{t("borrowRequests")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("borrowRequestsDesc")}
                  </p>
                </div>
              </FadeUp>

              <FadeUp key="requests-pagination" delay={0.2}>
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
                    <FadeIn
                      key="loading"
                    >
                      <DataLoading size="lg" />
                    </FadeIn>
                  ) : requests.length === 0 ? (
                    <FadeIn
                      key="empty"
                    >
                      <EmptyState
                        icon={<ClipboardList />}
                        title={t("noRequestsFound")}
                        description={t("noRequestsFoundDesc")}
                      />
                    </FadeIn>
                  ) : (
                    <FadeIn
                      key="content"
                    >
                      <StaggerContainer className="space-y-4">
                        {requests.map((req, index) => (
                          <SlideIn
                            key={req.id}
                            direction="up"
                            distance={20}
                            delay={index * 0.05}
                          >
                            <BorrowRequestCard
                              req={req}
                            />
                          </SlideIn>
                        ))}
                      </StaggerContainer>
                    </FadeIn>
                  )}
                </PaginatedContent>
              </FadeUp>
            </div>
          </TabsContent>
        </Tabs>
      </FadeUp>
    </StaggerContainer>
  );
}
