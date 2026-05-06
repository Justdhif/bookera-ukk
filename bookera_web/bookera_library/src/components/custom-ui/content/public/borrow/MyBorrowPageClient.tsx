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
import { ClipboardList, Package } from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";
import DateRangeFilter from "@/components/custom-ui/DateRangeFilter";
import { BorrowFilterParams } from "@/types/borrow";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { StaggerContainer, FadeUp, FadeIn, BlurIn, SlideIn, BounceIn } from "@/components/custom-ui/motion";
import { BorrowCard } from "./BorrowCard";
import { BorrowRequestCard } from "./BorrowRequestCard";

export default function MyBorrowPageClient() {
  const t = useTranslations("public");
  const tBorrow = useTranslations("borrow");
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(true);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState<BorrowFilterParams>({});
  const [borrowSearch, setBorrowSearch] = useState("");

  useEffect(() => {
    fetchBorrows(filters);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: borrowSearch }));
    }, 500);
    return () => clearTimeout(timer);
  }, [borrowSearch]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchBorrows = async (activeFilters?: BorrowFilterParams) => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getByUser(activeFilters);
      setBorrows(response.data.data);
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

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await borrowRequestService.getByUser();
      setRequests(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("common.failedToLoadBooks"),
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm(t("common.deleteConfirmDefault"))) return;
    setDeleteId(id);
    try {
      await borrowRequestService.cancel(id);
      toast.success(t("borrow-request.deleteSuccess"));
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("borrow-request.deleteError"));
    } finally {
      setDeleteId(null);
    }
  };

  const loadingState = (
    <FadeIn key="loading" className="flex justify-center py-12">
      <DataLoading variant="inline" size="lg" />
    </FadeIn>
  );

  const sortedBorrows = [...borrows].sort((left, right) => left.id - right.id);
  const sortedRequests = [...requests].sort((left, right) => left.id - right.id);
  const openBorrows = sortedBorrows.filter((borrow) => borrow.status === "open");
  const closedBorrows = sortedBorrows.filter((borrow) => borrow.status === "close");

  const borrowTabs = [
    {
      value: "all",
      label: tBorrow("allBorrows"),
      desc: tBorrow("allBorrowsDesc"),
      data: sortedBorrows,
      emptyTitle: tBorrow("noBorrowsFound"),
      emptyDesc: tBorrow("noBorrowsFoundDesc"),
    },
    {
      value: "open",
      label: tBorrow("openBorrows"),
      desc: tBorrow("openBorrowsDesc"),
      data: openBorrows,
      emptyTitle: tBorrow("noBorrowsFound"),
      emptyDesc: tBorrow("noBorrowsFoundDesc"),
    },
    {
      value: "closed",
      label: tBorrow("closedBorrows"),
      desc: tBorrow("closedBorrowsDesc"),
      data: closedBorrows,
      emptyTitle: tBorrow("noBorrowsFound"),
      emptyDesc: tBorrow("noBorrowsFoundDesc"),
    },
  ];

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("myBorrows")}
          description={t("myBorrowsDesc")}
          isAdmin
        />
      </FadeUp>

      <SlideIn direction="up" delay={0.1}>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              {tBorrow("all")} ({sortedBorrows.length})
            </TabsTrigger>
            <TabsTrigger value="open">
              {tBorrow("open")} ({openBorrows.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              {tBorrow("closed")} ({closedBorrows.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5" />
              {tBorrow("requests")} ({sortedRequests.length})
            </TabsTrigger>
          </TabsList>

          {borrowTabs.map(({ value, label, desc, data, emptyTitle, emptyDesc }) => (
            <TabsContent key={value} value={value} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={tBorrow("searchByNameOrTitle")}
                      value={borrowSearch}
                      onChange={handleBorrowSearchChange}
                      className="pl-10 h-11! w-full shadow-sm transition-all duration-300"
                    />
                  </div>
                  <DateRangeFilter onFilter={handleDateFilter} />
                </div>
                {loadingBorrows ? (
                  loadingState
                ) : data.length === 0 ? (
                  <FadeIn key="empty">
                    <EmptyState
                      icon={<Package />}
                      title={emptyTitle}
                      description={emptyDesc}
                    />
                  </FadeIn>
                ) : (
                  <div className="grid gap-4">
                    {data.map((borrow) => (
                      <BounceIn key={borrow.id}>
                        <BorrowCard borrow={borrow} />
                      </BounceIn>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="requests" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{t("myRequests")}</h3>
                <p className="text-sm text-muted-foreground">{t("myRequestsDesc")}</p>
              </div>
              {loadingRequests ? (
                loadingState
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
            </div>
          </TabsContent>
        </Tabs>
      </SlideIn>
    </StaggerContainer>
  );
}


