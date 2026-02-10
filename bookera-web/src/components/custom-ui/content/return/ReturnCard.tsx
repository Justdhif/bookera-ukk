import { BookReturn } from "@/types/book-return";
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
  Loader2,
  BookOpen,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircleIcon,
  AlertTriangle,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ReturnCardProps {
  bookReturn: BookReturn;
  loan: Loan;
  showActions?: boolean;
  actionLoading: number | null;
  onFinished?: (returnId: number) => void;
}

export function ReturnCard({
  bookReturn,
  loan,
  showActions = true,
  actionLoading,
  onFinished,
}: ReturnCardProps) {
  const router = useRouter();
  const tLoans = useTranslations('loans');
  const tStatus = useTranslations('status');

  const getLoanStatusBadge = (status: Loan["status"]) => {
    const variants: Record<
      Loan["status"],
      {
        variant: any;
        label: string;
        icon: React.ReactNode;
        className?: string;
      }
    > = {
      pending: {
        variant: "secondary",
        label: "Pending",
        icon: <Clock className="h-3 w-3 mr-1" />,
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      },
      waiting: {
        variant: "secondary",
        label: "Waiting",
        icon: <Clock className="h-3 w-3 mr-1" />,
        className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      },
      borrowed: {
        variant: "secondary",
        label: "Borrowed",
        icon: <BookOpen className="h-3 w-3 mr-1" />,
        className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      },
      checking: {
        variant: "secondary",
        label: "Checking",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      returned: {
        variant: "default",
        label: "Returned",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      },
      rejected: {
        variant: "destructive",
        label: "Rejected",
        icon: <XCircleIcon className="h-3 w-3 mr-1" />,
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
      late: {
        variant: "destructive",
        label: "Late",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
      lost: {
        variant: "destructive",
        label: "Lost",
        icon: <XCircleIcon className="h-3 w-3 mr-1" />,
        className: "bg-red-100 text-red-800 hover:bg-red-100",
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

  const getConditionBadge = (condition: "good" | "damaged" | "lost") => {
    const variants = {
      good: {
        variant: "default" as const,
        label: tStatus('good'),
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      damaged: {
        variant: "secondary" as const,
        label: tStatus('damaged'),
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      lost: {
        variant: "destructive" as const,
        label: tStatus('lost'),
        icon: <XCircleIcon className="h-3 w-3 mr-1" />,
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
    };

    return (
      <Badge
        variant={variants[condition]?.variant || "secondary"}
        className={variants[condition]?.className}
      >
        <span className="flex items-center">
          {variants[condition]?.icon}
          {variants[condition]?.label || condition}
        </span>
      </Badge>
    );
  };

  // Check conditions
  const hasDamagedBooks = bookReturn.details?.some((d) => d.condition === "damaged");
  const hasLostBooks = bookReturn.details?.some((d) => d.condition === "lost");
  const allGoodCondition = bookReturn.details?.every((d) => d.condition === "good");
  
  // Check if has damaged or lost books
  const hasDamagedOrLostBooks = hasDamagedBooks || hasLostBooks;
  
  // Check fine status - only for loans with fines
  const unpaidFines = loan.fines?.filter((f) => f.status === "unpaid") || [];
  const hasFines = loan.fines && loan.fines.length > 0;
  const hasUnpaidFines = unpaidFines.length > 0;
  const allFinesPaid = hasFines && unpaidFines.length === 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{tLoans('returnNumber')}{bookReturn.id}</CardTitle>
              {getLoanStatusBadge(loan.status)}
              <Badge variant="outline">{tLoans('loanNumber')}{bookReturn.loan_id}</Badge>
            </div>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {bookReturn.loan?.user?.profile?.full_name ||
                  bookReturn.loan?.user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(bookReturn.return_date), "dd MMM yyyy")}
              </span>
            </CardDescription>
          </div>
          {showActions && loan.status === "checking" && (
            <div className="flex gap-2">
              {/* Show Process Fine button when there are unpaid fines */}
              {hasUnpaidFines && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push(`/admin/fines?loan_id=${loan.id}`)}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Process Fine
                </Button>
              )}
              
              {/* Show Finished button when no unpaid fines (either no fines or all paid) */}
              {!hasUnpaidFines && (
                <Button
                  size="sm"
                  variant="submit"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onFinished?.(bookReturn.id)}
                  disabled={actionLoading === bookReturn.id}
                >
                  {actionLoading === bookReturn.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Finished
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            {tLoans('returnedBooks')} ({bookReturn.details?.length || 0}):
          </p>
          <div className="grid gap-2">
            {bookReturn.details?.map((detail) => (
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
                {getConditionBadge(detail.condition)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
