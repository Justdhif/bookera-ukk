import { Borrow } from "@/types/borrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PackageCheck,
  BookOpen,
  Calendar,
  User,
  CheckCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface BorrowCardProps {
  borrow: Borrow;
}

export function BorrowCard({ borrow }: BorrowCardProps) {
  const getStatusBadge = (status: Borrow["status"]) => {
    const variants: Record<
      Borrow["status"],
      { variant: any; label: string; icon: React.ReactNode; className?: string }
    > = {
      open: {
        variant: "default",
        label: "Open",
        icon: <PackageCheck className="h-3 w-3 mr-1" />,
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      close: {
        variant: "outline",
        label: "Closed",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
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
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">Borrow #{borrow.id}</CardTitle>
              {getStatusBadge(borrow.status)}
            </div>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {borrow.user?.profile?.full_name || borrow.user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <Calendar className="h-3 w-3" />
                Return: {format(new Date(borrow.return_date), "dd MMM yyyy")}
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap items-start">
            {borrow.borrow_code && (
              <Link href={`/admin/borrows/${borrow.borrow_code}`}>
                <Button size="sm" variant="outline" className="h-8">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Borrowed Books ({borrow.borrow_details?.length || 0}):
          </p>
          <div className="grid gap-3">
            {borrow.borrow_details?.map((detail) => (
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
                  </div>

                  {detail.note && (
                    <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      <span className="font-medium">Note: </span>
                      {detail.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

