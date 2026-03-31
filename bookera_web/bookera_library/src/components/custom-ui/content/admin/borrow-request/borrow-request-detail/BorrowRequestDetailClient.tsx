"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  PackageCheck,
  Loader2,
  Trash,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
const approvalStatusConfig: Record<
  BorrowRequest["approval_status"],
  { label: string; className: string }
> = {
  processing: {
    label: "Processing",
    className: "bg-violet-100 text-violet-700 hover:bg-violet-100",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  canceled: {
    label: "Canceled",
    className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  },
};
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
  const [rejectReason, setRejectReason] = useState("");
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
  const handleReject = async () => {
    if (!request) return;
    setRejecting(true);
    try {
      await borrowRequestService.reject(request.id, rejectReason || undefined);
      toast.success(t("rejectSuccess"));
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("rejectError"));
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
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  if (!request) return null;
  const statusCfg =
    approvalStatusConfig[request.approval_status] ??
    approvalStatusConfig.processing;
  const isProcessing = request.approval_status === "processing";
  return (
    <div className="space-y-6">
      <ContentHeader
        title={`Request #${request.id}`}
        description={t("requestInfoDesc")}
        showBackButton
        isAdmin
        rightActions={
          <div className="flex gap-2 flex-wrap text-xs md:text-sm">
            <Badge variant="secondary" className={`${statusCfg.className} h-8 px-3 flex items-center`}>
              {t(request.approval_status)}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting || approving || rejecting}
              className="h-8 gap-1"
            >
              <Trash className="h-4 w-4 mr-1" />
              {t("delete")}
            </Button>
            {isProcessing && (
              <>
                <Button
                  variant="brand"
                  size="sm"
                  className="h-8 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={approving || rejecting}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {t("reject")}
                </Button>
                <Button
                  variant="submit"
                  size="sm"
                  className="h-8 border-green-300 text-green-600 hover:bg-green-50"
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  loading={approving}
                >
                  {!approving && <CheckCircle2 className="h-4 w-4 mr-1" />}
                  {t("approve")}
                </Button>
              </>
            )}
          </div>
        }
      />
      {request.approval_status === "rejected" && request.reject_reason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm text-red-700">
                {t("rejectReason")}
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                {request.reject_reason}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("borrowerInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3 bg-muted/30 space-y-1">
              <p className="font-medium">
                {request.user?.profile?.full_name || "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                {request.user?.email}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {t("dates")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("borrowDate")}
                  </p>
                  <p className="font-medium">
                    {format(new Date(request.borrow_date), "dd MMMM yyyy")}
                  </p>
                </div>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("returnDate")}
                  </p>
                  <p className="font-medium">
                    {format(new Date(request.return_date), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("requestedBooks")} (
              {request.borrow_request_details?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {request.borrow_request_details?.map((detail) => (
                <div
                  key={detail.id}
                  className="rounded-lg border p-3 bg-muted/30 flex items-center gap-3"
                >
                  {detail.book?.cover_image ? (
                    <Image
                      src={detail.book.cover_image}
                      alt={detail.book.title}
                      className="h-12 w-9 object-cover rounded"
                      width={300}
                      height={400}
                      unoptimized
                    />
                  ) : (
                    <div className="h-12 w-9 bg-muted rounded flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{detail.book?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {detail.book?.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {isProcessing && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <PackageCheck className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">{t("howToProcess")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.rich("howToProcessDesc", {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              {t("rejectRequest")}
            </DialogTitle>
            <DialogDescription>{t("rejectDialogDesc")}</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t("rejectReasonPlaceholder")}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="brand"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejecting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="submit"
              onClick={handleReject}
              disabled={rejecting}
              loading={rejecting}
            >
              {!rejecting && <XCircle className="h-4 w-4 mr-1" />}
              {t("rejectRequest")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
