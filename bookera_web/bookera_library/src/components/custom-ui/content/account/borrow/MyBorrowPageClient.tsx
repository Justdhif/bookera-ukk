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

  useEffect(() => {
    fetchBorrows();
    fetchRequests();
  }, []);

  const fetchBorrows = async () => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getByUser();
      setBorrows(response.data.data);
    } catch (error) {
      console.error("Failed to fetch borrows:", error);
    } finally {
      setLoadingBorrows(false);
    }
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
    <div className="flex justify-center py-12">
      <DataLoading variant="inline" size="lg" />
    </div>
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
    <div className="space-y-6">
      <ContentHeader
        title={t("myBorrows")}
        description={t("myBorrowsDesc")}
        isAdmin
      />

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
              {loadingBorrows ? (
                loadingState
              ) : data.length === 0 ? (
                <EmptyState
                  icon={<Package />}
                  title={emptyTitle}
                  description={emptyDesc}
                />
              ) : (
                <div className="grid gap-4">
                  {data.map((borrow) => (
                    <BorrowCard key={borrow.id} borrow={borrow} />
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
              <EmptyState
                icon={<ClipboardList />}
                title={t("noRequestsYet")}
                description={t("noRequestsYetDesc")}
              />
            ) : (
              <div className="space-y-4">
                {sortedRequests.map((req) => (
                  <BorrowRequestCard
                    key={req.id}
                    request={req}
                    onDelete={handleDeleteRequest}
                    isDeleting={deleteId === req.id}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
