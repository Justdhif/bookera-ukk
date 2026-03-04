import { Borrow } from "@/types/borrow";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, DollarSign, RotateCcw, User } from "lucide-react";
import { format } from "date-fns";

interface BorrowInfoCardProps {
  borrow: Borrow;
}

export function BorrowInfoCard({ borrow }: BorrowInfoCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Borrow Information</CardTitle>
        <CardDescription>Complete details about this borrow record</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Borrower */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Borrower
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-4 bg-muted/20">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{borrow.user?.profile?.full_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{borrow.user?.email || "-"}</p>
            </div>
            {borrow.user?.profile?.identification_number && (
              <div>
                <p className="text-sm text-muted-foreground">ID Number</p>
                <p className="font-medium font-mono">
                  {borrow.user.profile.identification_number}
                </p>
              </div>
            )}
            {borrow.user?.profile?.phone_number && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{borrow.user.profile.phone_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dates
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">Borrow Date</p>
              <p className="font-medium">
                {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">Return Date</p>
              <p className="font-medium text-destructive">
                {format(new Date(borrow.return_date), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {format(new Date(borrow.created_at), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Fines */}
        {borrow.fines && borrow.fines.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Fines ({borrow.fines.length})
            </h3>
            <div className="grid gap-2">
              {borrow.fines.map((fine: any) => (
                <div
                  key={fine.id}
                  className="flex items-center justify-between rounded-lg border p-3 bg-muted/20"
                >
                  <div>
                    <p className="text-sm font-medium">{fine.fine_type?.name || "Fine"}</p>
                    <p className="text-xs text-muted-foreground">{fine.description || ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      Rp {Number(fine.amount || 0).toLocaleString("id-ID")}
                    </p>
                    <Badge
                      variant={fine.status === "paid" ? "default" : "secondary"}
                      className={
                        fine.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }
                    >
                      {fine.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Returns */}
        {borrow.book_returns && borrow.book_returns.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Return Records ({borrow.book_returns.length})
            </h3>
            <div className="grid gap-2">
              {borrow.book_returns.map((ret: any) => (
                <div
                  key={ret.id}
                  className="rounded-lg border p-3 bg-muted/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Return #{ret.id}</p>
                    <Badge variant="secondary">{ret.status}</Badge>
                  </div>
                  {ret.return_date && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ret.return_date), "dd MMM yyyy")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
