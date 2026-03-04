"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";

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
      const res = await borrowRequestService.adminShow(requestId);
      setRequest(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load request details",
      );
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
      toast.success("Request approved!");
      router.push("/admin/borrows");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setRejecting(true);
    try {
      await borrowRequestService.reject(request.id, rejectReason || undefined);
      toast.success("Request rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;
    setDeleting(true);
    try {
      await borrowRequestService.destroy(request.id);
      toast.success("Request deleted successfully");
      router.push("/admin/borrows");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete request");
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/borrows")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Request #{request.id}</h1>
              <Badge variant="secondary" className={statusCfg.className}>
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Complete borrow request information
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting || approving || rejecting}
            className="h-8 gap-1"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
          {isProcessing && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => setRejectDialogOpen(true)}
                disabled={approving || rejecting}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-green-300 text-green-600 hover:bg-green-50"
                onClick={handleApprove}
                disabled={approving || rejecting}
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                )}
                Approve
              </Button>
              </>
          )}
        </div>
      </div>

      {/* Reject reason display */}
      {request.approval_status === "rejected" && request.reject_reason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm text-red-700">Reject Reason</p>
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
              Borrower Information
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
                Dates
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Borrow Date
                  </p>
                  <p className="font-medium">
                    {format(new Date(request.borrow_date), "dd MMMM yyyy")}
                  </p>
                </div>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Return Date
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
              Requested Books ({request.borrow_request_details?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {request.borrow_request_details?.map((detail) => (
                <div
                  key={detail.id}
                  className="rounded-lg border p-3 bg-muted/30 flex items-center gap-3"
                >
                  {detail.book?.cover_image_url ? (
                    <img
                      src={detail.book.cover_image_url}
                      alt={detail.book.title}
                      className="h-12 w-9 object-cover rounded"
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
                <p className="font-medium text-sm">How to process a request</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click <strong>Approve</strong> to create a borrow record (code + QR) and
                  be redirected to the borrow detail page where you can assign book copies to the user.
                  Click <strong>Reject</strong> to decline the request and notify the user.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Request
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this borrow request (optional).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter reject reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting}
            >
              {rejecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) setDeleteDialogOpen(open);
        }}
        title="Delete Borrow Request"
        description="Are you sure you want to permanently delete this borrow request? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}