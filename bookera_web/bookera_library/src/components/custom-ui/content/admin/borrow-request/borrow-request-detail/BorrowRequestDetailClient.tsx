"use client";

import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash, XCircle } from "lucide-react";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import BorrowRequestSummaryCard from "./BorrowRequestSummaryCard";
import BorrowRequestInfoCard from "./BorrowRequestInfoCard";
import BorrowRequestBooksCard from "./BorrowRequestBooksCard";
import BorrowRequestRejectReasonCard from "./BorrowRequestRejectReasonCard";
import BorrowRequestRejectDialog from "./BorrowRequestRejectDialog";
import DataLoading from "@/components/custom-ui/DataLoading";

export default function AdminBorrowRequestDetailClient() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("borrow-request");
  const requestId = Number(params.id);
  const [request, setRequest] = useState<BorrowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

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

    setApproving(true);
    try {
      await borrowRequestService.approve(request.id);
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

  const handleDelete = async () => {
    if (!request) return;

    setDeleting(true);
    try {
      await borrowRequestService.delete(request.id);
      toast.success(t("deleteSuccess"));
      router.push("/admin/borrows");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("deleteError"));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <DataLoading size="lg" />;
  }

  if (!request) return null;

  return (
    <div className="space-y-6">
      <ContentHeader
        title={`Request #${request.id}`}
        description={t("requestInfoDesc")}
        showBackButton
        isAdmin
        rightActions={
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting || approving || rejecting}
              className="h-8 gap-1.5 px-3"
            >
              <Trash className="h-4 w-4" />
              {t("delete")}
            </Button>

            {request.approval_status === "processing" && (
              <>
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
                  disabled={approving || rejecting}
                  loading={approving}
                >
                  {!approving && <CheckCircle2 className="h-4 w-4" />}
                  {t("approve")}
                </Button>
              </>
            )}
          </div>
        }
      />

      <BorrowRequestRejectReasonCard request={request} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BorrowRequestSummaryCard request={request} />
        <BorrowRequestInfoCard request={request} />
      </div>

      <BorrowRequestBooksCard request={request} />

      <BorrowRequestRejectDialog
        open={rejectDialogOpen}
        loading={rejecting}
        onOpenChange={setRejectDialogOpen}
        onReject={handleReject}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) setDeleteDialogOpen(open);
        }}
        title={t("deleteRequest")}
        description={t("deleteDetailDesc")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
