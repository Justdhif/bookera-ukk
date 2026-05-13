"use client";

import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest, BorrowRequestDetail } from "@/types/borrow-request";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import BorrowRequestSummaryCard from "./BorrowRequestSummaryCard";
import BorrowRequestBooksCard from "./BorrowRequestBooksCard";
import BorrowRequestInfoCard from "./BorrowRequestInfoCard";
import BorrowRequestRejectReasonCard from "./BorrowRequestRejectReasonCard";
import BorrowRequestRejectDialog from "./BorrowRequestRejectDialog";
import DataLoading from "@/components/custom-ui/DataLoading";
import { BorrowRequestAssignCopiesCard } from "./BorrowRequestAssignCopiesCard";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";

export default function AdminBorrowRequestDetailClient() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("borrow-request");
  const tCommon = useTranslations("common");
  const requestId = Number(params.id);
  const [request, setRequest] = useState<BorrowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    detailId: number;
    action: "approve" | "reject";
  } | null>(null);
  const [rejectDetail, setRejectDetail] = useState<BorrowRequestDetail | null>(null);

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await borrowRequestService.getById(requestId, true);
      setRequest(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadDetailError"));
      router.push("/borrows");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDetail = async (detailId: number) => {
    if (!request) return;

    setActionLoading({ detailId, action: "approve" });
    try {
      await borrowRequestService.approve(request.id, detailId);
      toast.success(t("approveSuccess"));
      await fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("approveError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectDialog = (detail: BorrowRequestDetail) => {
    setRejectDetail(detail);
    setRejectDialogOpen(true);
  };

  const handleRejectDialogChange = (open: boolean) => {
    setRejectDialogOpen(open);

    if (!open) {
      setRejectDetail(null);
    }
  };

  const handleRejectDetail = async (rejectReason?: string) => {
    if (!request || !rejectDetail) return;

    setActionLoading({ detailId: rejectDetail.id, action: "reject" });
    try {
      await borrowRequestService.reject(request.id, rejectDetail.id, rejectReason);
      toast.success(t("rejectSuccess"));
      setRejectDialogOpen(false);
      setRejectDetail(null);
      await fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("rejectError"));
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const isBusy = actionLoading !== null;

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={`${tCommon("request")} #${request?.id || requestId}`}
          description={t("requestInfoDesc")}
          showBackButton
          isAdmin
        />
      </FadeUp>

      {loading ? (
        <FadeIn>
          <DataLoading size="lg" />
        </FadeIn>
      ) : !request ? (
        <FadeIn className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground italic">
          {t("loadDetailError")}
        </FadeIn>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <FadeUp delay={0.1}>
              <BorrowRequestSummaryCard request={request} />
            </FadeUp>
            <FadeUp delay={0.2}>
              <BorrowRequestInfoCard request={request} />
            </FadeUp>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FadeUp delay={0.3}>
              <BorrowRequestBooksCard
                request={request}
                onApproveDetail={handleApproveDetail}
                onRejectDetail={handleOpenRejectDialog}
                loadingDetailId={actionLoading?.detailId ?? null}
                loadingAction={actionLoading?.action ?? null}
                disabled={isBusy}
              />
            </FadeUp>
            
            <FadeUp delay={0.4}>
              {request.approval_status === "rejected" ? (
                <BorrowRequestRejectReasonCard request={request} />
              ) : (
                <BorrowRequestAssignCopiesCard
                  request={request}
                  onAssigned={fetchRequest}
                  disabled={isBusy}
                />
              )}
            </FadeUp>
          </div>

          <BorrowRequestRejectDialog
            open={rejectDialogOpen}
            loading={actionLoading?.action === "reject"}
            onOpenChange={handleRejectDialogChange}
            onReject={handleRejectDetail}
          />
        </div>
      )}
    </StaggerContainer>
  );
}
