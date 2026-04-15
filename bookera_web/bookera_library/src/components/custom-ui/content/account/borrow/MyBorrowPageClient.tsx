"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import BorrowDetailStatusBadge from "@/components/custom-ui/badge/BorrowDetailStatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import EmptyState from "@/components/custom-ui/EmptyState";
import {
  BookOpen,
  Calendar,
  Eye,
  ClipboardList,
  Trash,
  XCircle,
  Loader2,
} from "lucide-react";
import DataLoading from "@/components/custom-ui/DataLoading";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth.store";

import { BorrowCard } from "./BorrowCard";
import { BorrowRequestCard } from "./BorrowRequestCard";

export default function MyBorrowPageClient() {
  const t = useTranslations("public");
  const userSlug = useAuthStore((state) => state.user?.slug);
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

  return (
    <div className="space-y-6">
      <ContentHeader title={t("myLibrary")} description={t("myLibraryDesc")} />

      <Tabs defaultValue="borrows">
        <TabsList className="mb-4">
          <TabsTrigger value="borrows" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("myBorrows")}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            {t("myRequests")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrows" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {loadingBorrows ? (
            loadingState
          ) : borrows.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12 text-muted-foreground/50" />}
              title={t("noBorrowsYet")}
              description={t("noBorrowsYetDesc")}
            />
          ) : (
            <div className="grid gap-6">
              {borrows.map((borrow) => (
                <BorrowCard key={borrow.id} borrow={borrow} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {loadingRequests ? (
            loadingState
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-12 w-12 text-muted-foreground/50" />}
              title={t("noRequestsYet")}
              description={t("noRequestsYetDesc")}
            />
          ) : (
            <div className="grid gap-6">
              {requests.map((req) => (
                <BorrowRequestCard
                  key={req.id}
                  request={req}
                  onDelete={handleDeleteRequest}
                  isDeleting={deleteId === req.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
