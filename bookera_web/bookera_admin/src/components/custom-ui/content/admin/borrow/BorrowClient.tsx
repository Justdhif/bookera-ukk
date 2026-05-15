"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow, BorrowFilterParams } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, ClipboardList, QrCode, Plus, Download } from "lucide-react";
import Link from "next/link";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";
import ExportButton from "@/components/custom-ui/button/ExportButton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { BorrowCard } from "./BorrowCard";
import { BorrowRequestCard } from "./BorrowRequestCard";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { StaggerContainer, FadeUp, SlideIn, FadeIn } from "@/components/custom-ui/motion";
import QrScannerModal from "@/components/custom-ui/modal/QrScannerModal";
import { useRouter } from "next/navigation";

export default function BorrowClient() {
  const t = useTranslations("borrow");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({});

  const [borrowFilters, setBorrowFilters] = useState<BorrowFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
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

  const fetchRequests = async (activeFilters: any) => {
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
      setBorrowFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
      setRequestFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  useEffect(() => {
    fetchBorrows(borrowFilters);
  }, [borrowFilters]);

  useEffect(() => {
    fetchRequests(requestFilters);
  }, [requestFilters]);

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setDateRange({ start_date, end_date });
    setBorrowFilters((prev) => ({ ...prev, start_date, end_date, page: 1 }));
    setRequestFilters((prev) => ({ ...prev, start_date, end_date, page: 1 }));
  };

  const handleScanSuccess = (decodedText: string) => {
    router.push(`/admin/borrows/${decodedText}`);
  };
  
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await borrowService.exportData(borrowFilters);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `borrows_export_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(t("exportSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  const openBorrows = allBorrows.filter((b) => b.status === "open");
  const closedBorrows = allBorrows.filter((b) => b.status === "close");

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
          <BorrowCard key={borrow.id} borrow={borrow} index={index} />
        ))}
      </StaggerContainer>
    );
  };

  return (
    <StaggerContainer className="pt-1 md:pt-2 px-0">
      <ContentHeader
        title={t("managementTitle")}
        description={t("managementDesc")}
        isAdmin
        className="mb-6"
        rightActions={
          <div className="flex items-center gap-2">
            <RefreshButton
              onClick={() => fetchBorrows(borrowFilters)}
              loading={loadingBorrows}
            />
            <ExportButton
              onClick={handleExport}
              loading={exporting}
            />
            <Link href="/borrows/create">
              <Button variant="submit" className="h-8 gap-1">
                <Plus className="w-3.5 h-3.5" />
                {t("createBorrow")}
              </Button>
            </Link>
          </div>
        }
      />

      <FadeUp delay={0.1}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl shadow-sm border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 transition-all hidden md:flex"
            onClick={() => setIsScannerOpen(true)}
            title={t("scanQr")}
          >
            <QrCode className="h-5 w-5" />
          </Button>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchByUserOrTitle")}
              value={search}
              onChange={handleSearchChange}
              className="pl-10 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl shadow-sm border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 transition-all md:hidden"
              onClick={() => setIsScannerOpen(true)}
              title={t("scanQr")}
            >
              <QrCode className="h-5 w-5" />
            </Button>
            <DateRangeFilter 
              onFilter={handleDateFilter} 
            />
          </div>
        </div>
      </FadeUp>

      <QrScannerModal
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onScanSuccess={handleScanSuccess}
      />

      <SlideIn direction="up" delay={0.2}>
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all" className="space-y-3">
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
            <TabsTrigger value="requests">
              {t("requests")} ({requests.length})
            </TabsTrigger>
          </TabsList>

          {[
            { value: "all", data: allBorrows },
            { value: "open", data: openBorrows },
            { value: "closed", data: closedBorrows },
          ].map(({ value, data }) => (
            <TabsContent key={value} value={value}>
              <div className="space-y-4 mt-3">
                <PaginatedContent
                  currentPage={borrowPagination.current_page}
                  lastPage={borrowPagination.last_page}
                  total={borrowPagination.total}
                  from={borrowPagination.from}
                  to={borrowPagination.to}
                  onPageChange={(page) => setBorrowFilters((prev) => ({ ...prev, page }))}
                >
                  {loadingBorrows ? (
                    <DataLoading size="lg" />
                  ) : (
                    <FadeIn key="content">
                      {renderBorrowCards(data)}
                    </FadeIn>
                  )}
                </PaginatedContent>
              </div>
            </TabsContent>
          ))}

          <TabsContent value="requests">
            <div className="space-y-4 mt-3">
              <PaginatedContent
                currentPage={requestPagination.current_page}
                lastPage={requestPagination.last_page}
                total={requestPagination.total}
                from={requestPagination.from}
                to={requestPagination.to}
                onPageChange={(page) => setRequestFilters((prev) => ({ ...prev, page }))}
              >
                {loadingRequests ? (
                  <DataLoading size="lg" />
                ) : requests.length === 0 ? (
                  <FadeIn key="empty">
                    <EmptyState
                      icon={<ClipboardList />}
                      title={t("noRequestsFound")}
                      description={t("noRequestsFoundDesc")}
                    />
                  </FadeIn>
                ) : (
                  <FadeIn key="content">
                    <StaggerContainer className="space-y-4">
                      {requests.map((req, index) => (
                        <BorrowRequestCard key={req.id} req={req} index={index} />
                      ))}
                    </StaggerContainer>
                  </FadeIn>
                )}
              </PaginatedContent>
            </div>
          </TabsContent>
        </Tabs>
      </SlideIn>
    </StaggerContainer>
  );
}
