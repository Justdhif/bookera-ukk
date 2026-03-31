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
import { BorrowSkeletonCard } from "./BorrowSkeletonCard";
import { BorrowRequestCard } from "./BorrowRequestCard";
import { BorrowRequestSkeletonCard } from "./BorrowRequestSkeletonCard";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";

export default function BorrowClient() {
  const t = useTranslations("borrow");
  const [allBorrows, setAllBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [borrowFilters, setBorrowFilters] = useState<BorrowFilterParams>({
    per_page: 10,
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
  }>({ per_page: 10 });
  const [requestSearch, setRequestSearch] = useState("");
  const [requestPagination, setRequestPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const handleDeleteRequest = (id: number) => setDeleteId(id);

  const confirmDeleteRequest = async () => {
    if (!deleteId) return;
    try {
      await borrowRequestService.delete(deleteId);
      toast.success(t("deleteRequestSuccess"));
      setDeleteId(null);
      fetchRequests(requestFilters);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("deleteRequestError"));
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
          <Link href="/admin/borrows/create">
            <Button variant="submit">
              <Plus className="h-4 w-4" />
              {t("createBorrow")}
            </Button>
          </Link>
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
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchByUserOrTitle")}
                    value={borrowSearch}
                    onChange={handleBorrowSearchChange}
                    className="pl-10"
                  />
                </div>
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
                      <BorrowSkeletonCard key={i} />
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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchByNameOrTitle")}
                  value={requestSearch}
                  onChange={handleRequestSearchChange}
                  className="pl-9"
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
                    <BorrowRequestSkeletonCard key={i} />
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
                      onDelete={handleDeleteRequest}
                    />
                  ))}
                </div>
              )}
            </PaginatedContent>
          </div>
        </TabsContent>
      </Tabs>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteBorrowRequest")}
        description={t("deleteBorrowRequestDesc")}
        onConfirm={confirmDeleteRequest}
      />
    </div>
  );
}
