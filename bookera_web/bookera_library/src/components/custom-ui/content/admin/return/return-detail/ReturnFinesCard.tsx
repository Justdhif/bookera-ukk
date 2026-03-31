import { Fine } from "@/types/fine";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Receipt } from "lucide-react";
import { format } from "date-fns";

interface ReturnFinesCardProps {
  fines: Fine[];
}

export function ReturnFinesCard({ fines }: ReturnFinesCardProps) {
  const totalFineAmount = fines.reduce((sum, f) => sum + Number(f.amount), 0);
  const totalUnpaidAmount = fines
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const hasUnpaidFines = fines.some((f) => f.status === "unpaid");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Fines
        </CardTitle>
        <CardDescription>
          Fine details associated with this borrow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fines.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            No fines for this borrow
          </div>
        ) : (
          <div className="space-y-3">
            {fines.map((fine) => (
              <div
                key={fine.id}
                className="flex items-start justify-between rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {fine.fine_type?.name || "Fine"}
                  </p>
                  {fine.notes && (
                    <p className="text-xs text-muted-foreground">
                      {fine.notes}
                    </p>
                  )}
                  {fine.paid_at && (
                    <p className="text-xs text-green-600">
                      Paid at:
                      {format(new Date(fine.paid_at), "dd MMM yyyy HH:mm")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-semibold text-sm">
                    Rp {Number(fine.amount).toLocaleString("id-ID")}
                  </p>
                  <FineStatusBadge status={fine.status} />
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Fines</p>
                <p className="font-bold text-lg">
                  Rp {totalFineAmount.toLocaleString("id-ID")}
                </p>
              </div>
              {hasUnpaidFines && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="font-bold text-lg text-destructive">
                    Rp {totalUnpaidAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
