import { BookReturn } from "@/types/book-return";
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
  Loader2,
  BookOpen,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircleIcon,
  AlertTriangle,
} from "lucide-react";

interface ReturnCardProps {
  bookReturn: BookReturn;
  showActions?: boolean;
  actionLoading: number | null;
  onApprove?: (returnId: number) => void;
  onReject?: (bookReturn: BookReturn) => void;
}

export function ReturnCard({
  bookReturn,
  showActions = true,
  actionLoading,
  onApprove,
  onReject,
}: ReturnCardProps) {
  const getApprovalBadge = (status: BookReturn["approval_status"]) => {
    const variants: Record<
      BookReturn["approval_status"],
      {
        variant: any;
        label: string;
        icon: React.ReactNode;
        className?: string;
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
        label: "Good",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      damaged: {
        variant: "secondary" as const,
        label: "Damaged",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      lost: {
        variant: "destructive" as const,
        label: "Lost",
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">Return #{bookReturn.id}</CardTitle>
              {getApprovalBadge(bookReturn.approval_status)}
              <Badge variant="outline">Loan #{bookReturn.loan_id}</Badge>
            </div>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {bookReturn.loan?.user?.profile?.full_name ||
                  bookReturn.loan?.user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(bookReturn.return_date).toLocaleDateString("id-ID")}
              </span>
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex gap-2">
              {bookReturn.approval_status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApprove?.(bookReturn.id)}
                    disabled={actionLoading === bookReturn.id}
                  >
                    {actionLoading === bookReturn.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject?.(bookReturn)}
                    disabled={actionLoading === bookReturn.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Buku yang Dikembalikan ({bookReturn.details?.length || 0}):
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
