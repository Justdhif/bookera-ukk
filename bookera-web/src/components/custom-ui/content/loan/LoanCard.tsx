import { Loan } from "@/types/loan";
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

interface LoanCardProps {
  loan: Loan;
  showActions?: boolean;
  actionLoading: number | null;
  onApprove?: (loanId: number) => void;
  onReject?: (loan: Loan) => void;
  onMarkAsBorrowed?: (loanId: number) => void;
}

export function LoanCard({
  loan,
  showActions = true,
  actionLoading,
  onApprove,
  onReject,
  onMarkAsBorrowed,
}: LoanCardProps) {
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
              {loan.approval_status === "pending" && (
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
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject?.(loan)}
                    disabled={actionLoading === loan.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
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
          <div className="grid gap-2">
            {loan.loan_details?.map((detail) => (
              <div
                key={detail.id}
                className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3"
              >
                <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {detail.book_copy?.book?.title || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Copy Code: {detail.book_copy?.copy_code}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {detail.book_copy?.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}