"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Search, ClipboardList, QrCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow, BorrowFilterParams } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { BorrowCard } from "./borrow/BorrowCard";
import { BorrowRequestCard } from "./borrow/BorrowRequestCard";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import QrScannerModal from "@/components/custom-ui/modal/QrScannerModal";
import { StaggerContainer, FadeUp, FadeIn, SlideIn } from "@/components/custom-ui/motion";

export default function MyBorrowClient() {
  const t = useTranslations("borrow");
  const tp = useTranslations("public");
  const router = useRouter();

  // States
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [search, setSearch] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const [borrowFilters, setBorrowFilters] = useState<BorrowFilterParams>({
    per_page: 10,
    page: 1,
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
    per_page: 10,
    page: 1,
  });
  const [requestPagination, setRequestPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetchers
  const fetchBorrows = async (activeFilters: BorrowFilterParams) => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getByUser(activeFilters);
      const apiResponse = response.data;
      const paginatedData = apiResponse.data;
      const dataArray = Array.isArray(paginatedData) 
        ? paginatedData 
        : (paginatedData?.data || []);

      setAllBorrows(dataArray);
      setBorrowPagination({
        current_page: (paginatedData as any)?.current_page ?? 1,
        last_page: (paginatedData as any)?.last_page ?? 1,
        total: (paginatedData as any)?.total ?? 0,
        from: (paginatedData as any)?.from ?? 0,
        to: (paginatedData as any)?.to ?? 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || tp("loadError"));
    } finally {
      setLoadingBorrows(false);
    }
  };

  const fetchRequests = async (activeFilters: any) => {
    setLoadingRequests(true);
    try {
      const response = await borrowRequestService.getByUser(activeFilters);
      const apiResponse = response.data;
      const paginatedData = apiResponse.data;
      const dataArray = Array.isArray(paginatedData) 
        ? paginatedData 
        : (paginatedData?.data || []);

      setRequests(dataArray);
      setRequestPagination({
        current_page: (paginatedData as any)?.current_page ?? 1,
        last_page: (paginatedData as any)?.last_page ?? 1,
        total: (paginatedData as any)?.total ?? 0,
        from: (paginatedData as any)?.from ?? 0,
        to: (paginatedData as any)?.to ?? 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || tp("loadRequestsError"));
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    const tDebounce = setTimeout(() => {
      setBorrowFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
      setRequestFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
    }, 500);
    return () => clearTimeout(tDebounce);
  }, [search]);

  useEffect(() => {
    fetchBorrows(borrowFilters);
  }, [borrowFilters]);

  useEffect(() => {
    fetchRequests(requestFilters);
  }, [requestFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setBorrowFilters((prev) => ({ ...prev, start_date, end_date, page: 1 }));
    setRequestFilters((prev) => ({ ...prev, start_date, end_date, page: 1 }));
  };

  const handleScanSuccess = (decodedText: string) => {
    router.push(`/borrow/${decodedText}`);
  };

  const handleDeleteRequest = async (id: number) => {
    try {
      setDeleteId(id);
      await borrowRequestService.cancel(id);
      toast.success(t("deleteRequestSuccess"));
      fetchRequests(requestFilters);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("deleteRequestError"));
    } finally {
      setDeleteId(null);
    }
  };

  // Derived States - Exactly like Admin
  const openBorrows = allBorrows.filter((b) => b.status === "open");
  const closedBorrows = allBorrows.filter((b) => b.status === "close");

  // Render Helpers
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
        title={tp("myLoans")}
        description={tp("manageLoans")}
        showBackButton={false}
        className="mb-6"
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
                      title={tp("noRequestsYet")}
                      description={tp("noRequestsYetDesc")}
                    />
                  </FadeIn>
                ) : (
                  <FadeIn key="content">
                    <StaggerContainer className="space-y-4">
                      {requests.map((req, index) => (
                        <BorrowRequestCard 
                          key={req.id} 
                          request={req} 
                          index={index}
                          onDelete={handleDeleteRequest}
                          isDeleting={deleteId === req.id}
                        />
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
