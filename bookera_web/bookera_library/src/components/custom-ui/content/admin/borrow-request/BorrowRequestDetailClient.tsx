"use client";

import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import BorrowRequestSummaryCard from "./BorrowRequestSummaryCard";
import BorrowRequestBooksCard from "./BorrowRequestBooksCard";
import BorrowRequestInfoCard from "./BorrowRequestInfoCard";
import BorrowRequestRejectReasonCard from "./BorrowRequestRejectReasonCard";
import BorrowRequestRejectDialog from "./BorrowRequestRejectDialog";
import DataLoading from "@/components/custom-ui/DataLoading";
import { BorrowRequestAssignCopiesCard } from "./BorrowRequestAssignCopiesCard";

export default function AdminBorrowRequestDetailClient() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("borrow-request");
  const tCommon = useTranslations("common");
  const requestId = Number(params.id);
  const [request, setRequest] = useState<BorrowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([]);

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await borrowRequestService.getById(requestId);
      setRequest(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadDetailError"));
      router.push("/admin/borrows");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    if (selectedCopyIds.length !== request.borrow_request_details.length) {
      toast.error(
        t("selectCopiesError") ||
          "Please select all book copies before approving",
      );
      return;
    }

    setApproving(true);
    try {
      await borrowRequestService.approve(request.id, selectedCopyIds);
      toast.success(t("approveSuccess"));
      router.push("/admin/borrows");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("approveError"));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (rejectReason?: string) => {
    if (!request) return;

    setRejecting(true);
    try {
      await borrowRequestService.reject(request.id, rejectReason);
      toast.success(t("rejectSuccess"));
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("rejectError"));
      throw error;
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={`${tCommon("request")} #${request?.id || requestId}`}
        description={t("requestInfoDesc")}
        showBackButton
        isAdmin
        rightActions={
          !loading && request && request.approval_status === "processing" ? (
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                onClick={() => setRejectDialogOpen(true)}
                disabled={approving || rejecting}
              >
                <XCircle className="h-4 w-4" />
                {t("reject")}
              </Button>
              <Button
                variant="submit"
                size="sm"
                className="h-8 gap-1.5 px-3 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600/20 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                onClick={handleApprove}
                disabled={
                  approving ||
                  rejecting ||
                  selectedCopyIds.length !==
                    (request?.borrow_request_details?.length ?? 0)
                }
                loading={approving}
              >
                {!approving && <CheckCircle2 className="h-4 w-4" />}
                {t("approve")}
              </Button>
            </div>
          ) : null
        }
      />

      {loading ? (
        <DataLoading size="lg" />
      ) : !request ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground italic">
          {t("loadDetailError")}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid gap-6 lg:grid-cols-2">
            <BorrowRequestSummaryCard request={request} />
            <BorrowRequestInfoCard request={request} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <BorrowRequestBooksCard request={request} />
            {request.approval_status === "rejected" ? (
              <BorrowRequestRejectReasonCard request={request} />
            ) : (
              <BorrowRequestAssignCopiesCard
                request={request}
                onSelectionChange={setSelectedCopyIds}
                disabled={approving || rejecting}
              />
            )}
          </div>

          <BorrowRequestRejectDialog
            open={rejectDialogOpen}
            loading={rejecting}
            onOpenChange={setRejectDialogOpen}
            onReject={handleReject}
          />
        </div>
      )}
    </div>
  );
}
