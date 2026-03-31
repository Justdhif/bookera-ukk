import { BookReturn } from "@/types/book-return";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
interface ReturnInfoCardProps {
  bookReturn: BookReturn;
}
export function ReturnInfoCard({ bookReturn }: ReturnInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Information</CardTitle>
        <CardDescription>
          Complete details about this return record
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Borrower
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-4 bg-muted/20">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {bookReturn.borrow?.user?.profile?.full_name ||
                  bookReturn.borrow?.user?.email ||
                  "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">
                {bookReturn.borrow?.user?.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Borrow Code</p>
              <p className="font-medium font-mono">
                {bookReturn.borrow?.borrow_code || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Borrow Status</p>
              <BorrowStatusBadge status={bookReturn.borrow?.status ?? "open"} />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dates
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">Borrow Date</p>
              <p className="font-medium">
                {bookReturn.borrow?.borrow_date
                  ? format(
                      new Date(bookReturn.borrow.borrow_date),
                      "dd MMM yyyy",
                    )
                  : "-"}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Due Date
              </p>
              <p className="font-medium text-destructive">
                {bookReturn.borrow?.return_date
                  ? format(
                      new Date(bookReturn.borrow.return_date),
                      "dd MMM yyyy",
                    )
                  : "-"}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">Return Date</p>
              <p className="font-medium">
                {format(new Date(bookReturn.return_date), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
