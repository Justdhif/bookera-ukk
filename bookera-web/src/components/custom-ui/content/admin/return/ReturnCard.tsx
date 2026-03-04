import { useRouter } from "next/navigation";
import { BookReturn } from "@/types/book-return";
import { Borrow } from "@/types/borrow";
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
  BookOpen,
  Calendar,
  User,
  CheckCircle,
  XCircleIcon,
  AlertTriangle,
  Eye,
  DollarSign,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface ReturnCardProps {
  bookReturn: BookReturn;
  borrow: Borrow;
  showActions?: boolean;
  actionLoading?: number | null;
  onFinished?: (returnId: number) => void;
  onProcessFine?: (returnId: number) => void;
}

export function ReturnCard({
  bookReturn,
  borrow,
  showActions = true,
  actionLoading,
  onFinished,
  onProcessFine,
}: ReturnCardProps) {
  const router = useRouter();

  const getBorrowStatusBadge = (status: Borrow["status"]) => {
    const variants: Record<
      Borrow["status"],
      { label: string; className: string }
    > = {
      open: {
        label: "Aktif",
        className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      },
      close: {
        label: "Selesai",
        className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      },
    };

    return (
      <Badge className={variants[status]?.className}>
        {variants[status]?.label || status}
      </Badge>
    );
  };

  const getConditionBadge = (condition: "good" | "damaged" | "lost") => {
    const variants = {
      good: {
        label: "Baik",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      damaged: {
        label: "Rusak",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      lost: {
        label: "Hilang",
        icon: <XCircleIcon className="h-3 w-3 mr-1" />,
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
    };

    return (
      <Badge className={variants[condition]?.className}>
        <span className="flex items-center">
          {variants[condition]?.icon}
          {variants[condition]?.label || condition}
        </span>
      </Badge>
    );
  };

  const fines = borrow.fines ?? [];
  const unpaidFines = fines.filter((f) => f.status === "unpaid");
  const hasFines = fines.length > 0;
  const hasUnpaidFines = unpaidFines.length > 0;
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + Number(f.amount), 0);

  const hasDamagedBooks = bookReturn.details?.some(
    (d) => d.condition === "damaged",
  );
  const hasLostBooks = bookReturn.details?.some((d) => d.condition === "lost");
  const hasDamagedOrLostBooks = hasDamagedBooks || hasLostBooks;

  const shouldShowProcessFine = hasDamagedOrLostBooks && !hasFines;
  const shouldShowFinished = !hasDamagedOrLostBooks || (hasFines && !hasUnpaidFines);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">Return #{bookReturn.id}</CardTitle>
              {getBorrowStatusBadge(borrow.status)}
              <Badge variant="outline">Borrow #{bookReturn.borrow_id}</Badge>
              {hasUnpaidFines && (
                <Badge className="bg-red-100 text-red-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Denda Rp {totalUnpaid.toLocaleString("id-ID")}
                </Badge>
              )}
              {hasFines && !hasUnpaidFines && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Denda Lunas
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {bookReturn.borrow?.user?.profile?.full_name ||
                  bookReturn.borrow?.user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(bookReturn.return_date), "dd MMM yyyy")}
              </span>
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex gap-2">
              {borrow.status === "open" && (
                <>
                  {shouldShowProcessFine && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onProcessFine?.(bookReturn.id)}
                      disabled={actionLoading === bookReturn.id}
                    >
                      {actionLoading === bookReturn.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <DollarSign className="h-4 w-4 mr-1" />
                      )}
                      Proses Denda
                    </Button>
                  )}
                  {shouldShowFinished && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => onFinished?.(bookReturn.id)}
                      disabled={actionLoading === bookReturn.id}
                    >
                      {actionLoading === bookReturn.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      )}
                      Selesai
                    </Button>
                  )}
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/returns/${bookReturn.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Lihat Detail
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Buku Dikembalikan ({bookReturn.details?.length || 0}):
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
