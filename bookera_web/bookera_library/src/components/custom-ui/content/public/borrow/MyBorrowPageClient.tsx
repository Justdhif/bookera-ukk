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
import { ReportLostDialog } from "./ReportLostDialog";
import { ReturnDialog } from "./ReturnDialog";
import {
  PackageX,
  BookOpen,
  Calendar,
  AlertCircle,
  Eye,
  ClipboardList,
  Trash,
  Loader2,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MyBorrowPageClient() {
  const t = useTranslations("public");
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(true);
  const [returnDialog, setReturnDialog] = useState<{
    open: boolean;
    borrow: Borrow | null;
  }>({ open: false, borrow: null });
  const [reportLostDialog, setReportLostDialog] = useState<{
    open: boolean;
    borrow: Borrow | null;
  }>({ open: false, borrow: null });
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
        error.response?.data?.message || "Failed to load borrow requests"
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    setDeleteId(id);
    try {
      await borrowRequestService.cancel(id);
      toast.success("Request cancelled successfully");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    } finally {
      setDeleteId(null);
    }
  };

  const canReturn = (borrow: Borrow) => borrow.status === "open";

  const borrowsSkeleton = (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const requestsSkeleton = (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-xl" />
      ))}
    </div>
  );

  // Define approvalStatusConfig outside the render function or memoize it if it depends on props/state
  const approvalStatusConfig: Record<
    string,
    { label: string; className: string }
  > = {
    processing: {
      label: "Awaiting Processing",
      className: "text-violet-700 bg-violet-100 hover:bg-violet-100",
    },
    approved: {
      label: "Approved",
      className: "text-green-700 bg-green-100 hover:bg-green-100",
    },
    rejected: {
      label: "Rejected",
      className: "text-red-700 bg-red-100 hover:bg-red-100",
    },
    canceled: {
      label: "Canceled",
      className: "text-gray-600 bg-gray-100 hover:bg-gray-100",
    },
  };
  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("myLibrary")}
        description={t("myLibraryDesc")}
      />

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

        <TabsContent value="borrows" className="space-y-4">
          {loadingBorrows ? (
            borrowsSkeleton
          ) : borrows.length === 0 ? (
            <EmptyState
              icon={<BookOpen />}
              title={t("noBorrowsYet")}
              description={t("noBorrowsYetDesc")}
            />
          ) : (
            <div className="grid gap-4">
              {borrows.map((borrow) => (
                <Card key={borrow.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold">
                          {t("borrowHash")}
                          {borrow.id}
                        </span>
                        <BorrowStatusBadge status={borrow.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(borrow.borrow_date).toLocaleDateString(
                            "en-US"
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-destructive">
                          <Calendar className="h-3 w-3" />
                          {t("returnLabel")}:
                          {new Date(borrow.return_date).toLocaleDateString(
                            "en-US"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {borrow.borrow_code && (
                        <Link href={`/my-borrows/${borrow.borrow_code}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            {t("detailsBtn")}
                          </Button>
                        </Link>
                      )}
                      {canReturn(borrow) && (
                        <Button
                          variant="submit"
                          size="sm"
                          onClick={() =>
                            setReturnDialog({ open: true, borrow })
                          }
                          className="flex items-center gap-2"
                        >
                          <PackageX className="h-4 w-4" />
                          {t("requestReturn")}
                        </Button>
                      )}
                      {canReturn(borrow) && (
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() =>
                            setReportLostDialog({ open: true, borrow })
                          }
                          className="flex items-center gap-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {t("reportLoss")}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground mb-3">
                      {t("borrowedBooks")} ({borrow.borrow_details.length}):
                    </div>
                    <div className="grid gap-2">
                      {borrow.borrow_details.map((detail) => (
                        <div
                          key={detail.id}
                          className="flex items-start gap-3 border rounded-lg p-3 bg-muted/20"
                        >
                          <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {detail.book_copy.book.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-muted-foreground">
                                    {t("codeLabel")}:
                                    <span className="font-mono">
                                      {detail.book_copy.copy_code}
                                    </span>
                                  </p>
                                  <BorrowDetailStatusBadge
                                    status={detail.status}
                                  />
                                </div>
                              </div>
                            </div>
                            {detail.note && (
                              <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                                <span className="font-medium">
                                  {t("noteLabel")}:
                                </span>
                                {detail.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {loadingRequests ? (
            requestsSkeleton
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<ClipboardList />}
              title={t("noRequestsYet")}
              description={t("noRequestsYetDesc")}
            />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const cfg =
                  approvalStatusConfig[req.approval_status] ??
                  approvalStatusConfig["processing"];
                return (
                  <Card
                    key={req.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="font-semibold text-base">
                          {t("requestHash")}
                          {req.id}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`${cfg.className} w-fit`}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {format(new Date(req.borrow_date), "dd MMM yyyy")}
                            &rarr;
                            {format(new Date(req.return_date), "dd MMM yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>
                            {req.borrow_request_details?.length ?? 0} book(s)
                          </span>
                        </div>
                      </div>
                      {req.borrow_request_details &&
                        req.borrow_request_details.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {req.borrow_request_details.map((d) => (
                              <span
                                key={d.id}
                                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                              >
                                <BookOpen className="h-3 w-3" />
                                {d.book?.title ?? `Book #${d.book_id}`}
                              </span>
                            ))}
                          </div>
                        )}
                      {req.approval_status === "rejected" &&
                        req.reject_reason && (
                          <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                              <span className="font-medium">
                                {t("rejectionReason")}:
                              </span>
                              {req.reject_reason}
                            </span>
                          </div>
                        )}
                      {req.approval_status === "processing" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRequest(req.id)}
                            disabled={deleteId === req.id}
                          >
                            {deleteId === req.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : (
                              <Trash className="h-3.5 w-3.5 mr-1" />
                            )}
                            {t("detail.editDialog.cancel")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ReturnDialog
        open={returnDialog.open}
        onOpenChange={(open) =>
          setReturnDialog({ open, borrow: open ? returnDialog.borrow : null })
        }
        borrow={returnDialog.borrow}
        onSuccess={fetchBorrows}
      />
      <ReportLostDialog
        open={reportLostDialog.open}
        onOpenChange={(open) =>
          setReportLostDialog({
            open,
            borrow: open ? reportLostDialog.borrow : null,
          })
        }
        borrow={reportLostDialog.borrow}
        onSuccess={fetchBorrows}
      />
    </div>
  );
}
