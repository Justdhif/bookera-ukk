"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/custom-ui/EmptyState";
import { ClipboardList, Package, Search, QrCode } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { BorrowFilterParams } from "@/types/borrow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";

import {
  StaggerContainer,
  FadeUp,
  FadeIn,
  SlideIn,
  BounceIn,
} from "@/components/custom-ui/motion";
import { BorrowCard } from "./borrow/BorrowCard";
import { BorrowRequestCard } from "./borrow/BorrowRequestCard";
import QrScannerModal from "@/components/custom-ui/modal/QrScannerModal";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function MyBorrowClient() {
  const router = useRouter();
  const t = useTranslations("public");
  const tBorrow = useTranslations("borrow");
  const tProfile = useTranslations("profile");
  const { user: currentUser } = useAuthStore();
  const isMe = true;

  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(true);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<BorrowFilterParams>({
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

  const [requestFilters, setRequestFilters] = useState({
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

  const [borrowSearch, setBorrowSearch] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    fetchBorrows({ ...filters, status: activeTab === "all" ? undefined : activeTab });
  }, [filters, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: borrowSearch, page: 1 }));
      setRequestFilters((prev) => ({ ...prev, search: borrowSearch, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [borrowSearch]);

  useEffect(() => {
    fetchRequests(requestFilters);
  }, [requestFilters]);

  const fetchBorrows = async (activeFilters?: BorrowFilterParams) => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getByUser(activeFilters);
      const apiResponse = response.data;
      const paginatedData = apiResponse.data;
      
      const dataArray = Array.isArray(paginatedData) 
        ? paginatedData 
        : (paginatedData?.data || []);

      setBorrows(dataArray);
      
      if (!Array.isArray(paginatedData)) {
        setBorrowPagination({
          current_page: paginatedData?.current_page ?? 1,
          last_page: paginatedData?.last_page ?? 1,
          total: paginatedData?.total ?? 0,
          from: paginatedData?.from ?? 0,
          to: paginatedData?.to ?? 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch borrows:", error);
    } finally {
      setLoadingBorrows(false);
    }
  };

  const handleBorrowSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorrowSearch(e.target.value);
  };

  const handleDateFilter = (start_date?: string, end_date?: string) => {
    setFilters((prev) => ({
      ...prev,
      start_date,
      end_date,
    }));
  };

  const handleScanSuccess = (decodedText: string) => {
    router.push(`/borrow/${decodedText}`);
  };

  const fetchRequests = async (activeFilters?: any) => {
    setLoadingRequests(true);
    try {
      const response = await borrowRequestService.getByUser(activeFilters);
      const apiResponse = response.data;
      const paginatedData = apiResponse.data;

      const dataArray = Array.isArray(paginatedData) 
        ? paginatedData 
        : (paginatedData?.data || []);

      setRequests(dataArray);

      if (!Array.isArray(paginatedData)) {
        setRequestPagination({
          current_page: paginatedData?.current_page ?? 1,
          last_page: paginatedData?.last_page ?? 1,
          total: paginatedData?.total ?? 0,
          from: paginatedData?.from ?? 0,
          to: paginatedData?.to ?? 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    try {
      setDeleteId(id);
      await borrowRequestService.cancel(id);
      toast.success(tBorrow("deleteRequestSuccess"));
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || tBorrow("deleteRequestError"));
    } finally {
      setDeleteId(null);
    }
  };

  const sortedBorrows = borrows;
  const sortedRequests = requests;

  const borrowTabs = [
    {
      value: "all",
      data: sortedBorrows,
      emptyTitle: tBorrow("noBorrowsFound"),
      emptyDesc: tBorrow("noBorrowsFoundDesc"),
    },
    {
      value: "open",
      data: sortedBorrows,
      emptyTitle: tBorrow("noBorrowsFound"),
      emptyDesc: tBorrow("noBorrowsFoundDesc"),
    },
    {
      value: "closed",
      data: sortedBorrows,
      emptyTitle: tBorrow("noBorrowsFound"),
      emptyDesc: tBorrow("noBorrowsFoundDesc"),
    },
  ];

  return (
    <StaggerContainer className="pt-1 md:pt-2 px-0">
      <ContentHeader
        title={isMe ? t("myLoans") : tProfile("borrow")}
        description={t("manageLoans")}
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
            title={tBorrow("scanQr")}
          >
            <QrCode className="h-5 w-5" />
          </Button>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tBorrow("searchByUserOrTitle")}
              value={borrowSearch}
              onChange={handleBorrowSearchChange}
              className="pl-10 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl shadow-sm border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/5 transition-all md:hidden"
              onClick={() => setIsScannerOpen(true)}
              title={tBorrow("scanQr")}
            >
              <QrCode className="h-5 w-5" />
            </Button>
            <DateRangeFilter onFilter={handleDateFilter} />
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
              {tBorrow("all")}
            </TabsTrigger>
            <TabsTrigger value="open">
              {tBorrow("open")}
            </TabsTrigger>
            <TabsTrigger value="closed">
              {tBorrow("closed")}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5" />
              {tBorrow("requests")}
            </TabsTrigger>
          </TabsList>

          {borrowTabs.map(({ value, data, emptyTitle, emptyDesc }) => (
            <TabsContent key={value} value={value}>
              <div className="space-y-4">
                <PaginatedContent
                  currentPage={borrowPagination.current_page}
                  lastPage={borrowPagination.last_page}
                  total={borrowPagination.total}
                  from={borrowPagination.from}
                  to={borrowPagination.to}
                  onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                >
                  {loadingBorrows ? (
                    <DataLoading />
                  ) : data.length === 0 ? (
                    <FadeIn key="empty">
                      <EmptyState
                        icon={<Package />}
                        title={emptyTitle}
                        description={emptyDesc}
                      />
                    </FadeIn>
                  ) : (
                    <StaggerContainer className="grid gap-4">
                      {data.map((borrow, index) => (
                        <SlideIn
                          key={borrow.id}
                          direction="up"
                          distance={20}
                          delay={index * 0.05}
                        >
                          <BorrowCard borrow={borrow} />
                        </SlideIn>
                      ))}
                    </StaggerContainer>
                  )}
                </PaginatedContent>
              </div>
            </TabsContent>
          ))}

          <TabsContent value="requests">
            <div className="space-y-4">
              <PaginatedContent
                currentPage={requestPagination.current_page}
                lastPage={requestPagination.last_page}
                total={requestPagination.total}
                from={requestPagination.from}
                to={requestPagination.to}
                onPageChange={(page) => setRequestFilters((prev) => ({ ...prev, page }))}
              >
                {loadingRequests ? (
                  <DataLoading />
                ) : sortedRequests.length === 0 ? (
                  <FadeIn key="empty-requests">
                    <EmptyState
                      icon={<ClipboardList />}
                      title={t("noRequestsYet")}
                      description={t("noRequestsYetDesc")}
                    />
                  </FadeIn>
                ) : (
                  <div className="space-y-4">
                    {sortedRequests.map((req) => (
                      <BounceIn key={req.id}>
                        <BorrowRequestCard
                          request={req}
                          onDelete={handleDeleteRequest}
                          isDeleting={deleteId === req.id}
                        />
                      </BounceIn>
                    ))}
                  </div>
                )}
              </PaginatedContent>
            </div>
          </TabsContent>
        </Tabs>
      </SlideIn>
    </StaggerContainer>
  );
}
