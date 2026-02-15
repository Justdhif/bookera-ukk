import { Loan, LoanDetail } from "@/types/loan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  PackageCheck,
  Loader2,
  BookOpen,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircleIcon,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface LoanCardProps {
  loan: Loan;
  showActions?: boolean;
  actionLoading: number | null | string;
  onApprove?: (loanId: number) => void;
  onReject?: (loan: Loan) => void;
  onMarkAsBorrowed?: (loanId: number) => void;
  onApproveDetail?: (detailId: number) => void;
  onRejectDetail?: (detailId: number, note: string) => void;
}

export function LoanCard({
  loan,
  showActions = true,
  actionLoading,
  onApprove,
  onReject,
  onMarkAsBorrowed,
  onApproveDetail,
  onRejectDetail,
}: LoanCardProps) {
  const [rejectDetailDialog, setRejectDetailDialog] = useState<{
    open: boolean;
    detail: LoanDetail | null;
  }>({ open: false, detail: null });
  const [rejectNote, setRejectNote] = useState("");
  const t = useTranslations('loans');
  const tStatus = useTranslations('status');
  const getStatusBadge = (status: Loan["status"]) => {
    const variants: Record<
      Loan["status"],
      { 
        variant: any; 
        label: string; 
        icon: React.ReactNode;
        className?: string 
      }
    > = {
      pending: {
        variant: "secondary",
        label: "Pending",
        icon: <Clock className="h-3 w-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      waiting: {
        variant: "default",
        label: "Waiting",
        icon: <Clock className="h-3 w-3 mr-1" />,
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      },
      borrowed: {
        variant: "default",
        label: "Borrowed",
        icon: <PackageCheck className="h-3 w-3 mr-1" />,
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      checking: {
        variant: "secondary",
        label: "Checking",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      },
      returned: {
        variant: "outline",
        label: "Returned",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      },
      rejected: { 
        variant: "destructive", 
        label: "Rejected",
        icon: <XCircleIcon className="h-3 w-3 mr-1" />,
      },
      late: { 
        variant: "destructive", 
        label: "Late",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      lost: {
        variant: "destructive",
        label: "Lost",
        icon: <XCircleIcon className="h-3 w-3 mr-1" />,
        className: "bg-red-100 text-white hover:bg-red-100",
      },
    };

    return (
      <Badge
        variant={variants[status]?.variant || "secondary"}
        className={variants[status]?.className}
      >
        <span className="flex items-center">
          {variants[status]?.icon}
          {variants[status]?.label || status}
        </span>
      </Badge>
    );
  };

  const getApprovalBadge = (status: Loan["approval_status"]) => {
    const variants: Record<
      Loan["approval_status"],
      { 
        variant: any; 
        label: string; 
        icon: React.ReactNode;
        className?: string 
      }
    > = {
      pending: {
        variant: "secondary",
        label: "Pending Approval",
        icon: <Clock className="h-3 w-3 mr-1" />,
        className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      },
      processing: {
        variant: "secondary",
        label: "Processing",
        icon: <Clock className="h-3 w-3 mr-1" />,
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      },
      approved: {
        variant: "default",
        label: "Approved",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      },
      rejected: { 
        variant: "destructive", 
        label: "Rejected",
        icon: <XCircleIcon className="h-3 w-3 mr-1" />,
      },
      partial: {
        variant: "secondary",
        label: "Partially Approved",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
    };

    return (
      <Badge
        variant={variants[status]?.variant || "secondary"}
        className={variants[status]?.className}
      >
        <span className="flex items-center">
          {variants[status]?.icon}
          {variants[status]?.label || status}
        </span>
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{t('loanNumber')}{loan.id}</CardTitle>
              {getStatusBadge(loan.status)}
              {getApprovalBadge(loan.approval_status)}
            </div>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {loan.user?.profile?.full_name || loan.user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(loan.loan_date), "dd MMM yyyy")}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <Calendar className="h-3 w-3" />
                {t('due')}: {format(new Date(loan.due_date), "dd MMM yyyy")}
              </span>
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex gap-2">
              {(loan.approval_status === "pending" || loan.approval_status === "processing") && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApprove?.(loan.id)}
                    disabled={actionLoading === loan.id}
                  >
                    {actionLoading === loan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    )}
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject?.(loan)}
                    disabled={actionLoading === loan.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject All
                  </Button>
                </>
              )}
              {loan.approval_status === "approved" && loan.status === "waiting" && (
                <Button
                  size="sm"
                  variant="submit"
                  onClick={() => onMarkAsBorrowed?.(loan.id)}
                  disabled={actionLoading === loan.id}
                >
                  {actionLoading === loan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PackageCheck className="h-4 w-4 mr-1" />
                  )}
                  {tStatus('markAsBorrowed')}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            {t('borrowedBooks')} ({loan.loan_details?.length || 0}):
          </p>
          <div className="grid gap-3">
            {loan.loan_details?.map((detail) => {
              const getDetailApprovalBadge = (status: LoanDetail["approval_status"]) => {
                const variants: Record<
                  LoanDetail["approval_status"],
                  { variant: any; label: string; icon: React.ReactNode; className?: string }
                > = {
                  pending: {
                    variant: "secondary",
                    label: "Pending",
                    icon: <Clock className="h-3 w-3 mr-1" />,
                    className: "bg-orange-100 text-orange-800",
                  },
                  approved: {
                    variant: "default",
                    label: "Approved",
                    icon: <CheckCircle className="h-3 w-3 mr-1" />,
                    className: "bg-emerald-100 text-emerald-800",
                  },
                  rejected: {
                    variant: "destructive",
                    label: "Rejected",
                    icon: <XCircleIcon className="h-3 w-3 mr-1" />,
                  },
                };

                return (
                  <Badge variant={variants[status]?.variant || "secondary"} className={variants[status]?.className}>
                    <span className="flex items-center">
                      {variants[status]?.icon}
                      {variants[status]?.label || status}
                    </span>
                  </Badge>
                );
              };

              return (
                <div
                  key={detail.id}
                  className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {detail.book_copy?.book?.title || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Copy Code: {detail.book_copy?.copy_code}
                        </p>
                      </div>
                      {getDetailApprovalBadge(detail.approval_status)}
                    </div>
                    
                    {detail.note && (
                      <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                        <span className="font-medium">Note: </span>
                        {detail.note}
                      </div>
                    )}

                    {showActions && detail.approval_status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs"
                          onClick={() => onApproveDetail?.(detail.id)}
                          disabled={actionLoading === `detail-${detail.id}`}
                        >
                          {actionLoading === `detail-${detail.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => setRejectDetailDialog({ open: true, detail })}
                          disabled={actionLoading === `detail-${detail.id}`}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <Dialog 
        open={rejectDetailDialog.open} 
        onOpenChange={(open) => {
          setRejectDetailDialog({ open, detail: rejectDetailDialog.detail });
          if (!open) setRejectNote("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Book Copy</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this book copy from the loan request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Rejection Note</Label>
              <Textarea
                id="note"
                placeholder="Enter rejection reason..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDetailDialog({ open: false, detail: null });
                setRejectNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectDetailDialog.detail) {
                  onRejectDetail?.(rejectDetailDialog.detail.id, rejectNote);
                  setRejectDetailDialog({ open: false, detail: null });
                  setRejectNote("");
                }
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}