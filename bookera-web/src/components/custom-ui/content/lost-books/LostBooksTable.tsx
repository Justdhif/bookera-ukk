"use client";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LostBook } from "@/types/lost-book";
import EmptyState from "@/components/custom-ui/EmptyState";
import {
  AlertCircle,
  Trash2,
  CheckCircle,
  BookOpen,
  Loader2,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
export default function LostBooksTable({
  data,
  onDelete,
  onFinish,
  onProcessFine,
  actionLoading,
}: {
  data: LostBook[];
  onDelete: (id: number) => void;
  onFinish: (id: number) => void;
  onProcessFine: (id: number) => void;
  actionLoading: number | null;
}) {
  const router = useRouter();
  if (data.length === 0) {
    return (
      <EmptyState
        title={"No lost books yet"}
        description={"Lost book reports will appear here."}
        icon={<AlertCircle className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead className="font-semibold">{"Borrower"}</TableHead>
            <TableHead className="font-semibold">{"Book"}</TableHead>
            <TableHead className="font-semibold">{"Loan ID"}</TableHead>
            <TableHead className="font-semibold">{"Loan Status"}</TableHead>
            <TableHead className="font-semibold">{"Date Lost"}</TableHead>
            <TableHead className="font-semibold">{"Notes"}</TableHead>
            <TableHead className="font-semibold text-right">{"Actions"}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id}
              className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
            >
              <TableCell className="font-medium text-center text-muted-foreground">
                {index + 1}
              </TableCell>

              <TableCell>
                <div>
                  <div className="font-medium text-foreground">
                    {item.loan?.user?.profile?.full_name || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.loan?.user?.email || "-"}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">
                      {item.book_copy?.book?.title || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {"Copy Code"}: {item.book_copy?.copy_code || "-"}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Button
                  variant="link"
                  className="h-auto p-0 font-mono text-primary hover:underline"
                  onClick={() => router.push(`/admin/loans?loan_id=${item.loan_id}`)}
                >
                  #{item.loan_id}
                </Button>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    item.loan?.status === "lost"
                      ? "destructive"
                      : item.loan?.status === "checking"
                      ? "secondary"
                      : "default"
                  }
                  className={
                    item.loan?.status === "checking"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      : ""
                  }
                >
                  {item.loan?.status === "borrowed"
                    ? "Dipinjam"
                    : item.loan?.status === "checking"
                    ? "Checking"
                    : item.loan?.status === "lost"
                    ? "Lost"
                    : item.loan?.status || "-"}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  {item.estimated_lost_date ? (
                    <div className="text-foreground">
                      {format(new Date(item.estimated_lost_date), "dd MMM yyyy", {
                        locale: localeId,
                      })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      {"Unknown lost date"}
                    </span>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {"Reported at"}{" "}
                    {format(new Date(item.created_at), "dd MMM yyyy", {
                      locale: localeId,
                    })}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {item.notes ? (
                  <div className="text-sm text-muted-foreground max-w-xs truncate">
                    {item.notes}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic text-sm">
                    {"No notes"}
                  </span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex justify-end items-center gap-2">
                  {item.loan?.status === "checking" && (() => {
                    const unpaidFines = item.loan?.fines?.filter((f: any) => f.status === "unpaid") || [];
                    const hasFines = item.loan?.fines && item.loan.fines.length > 0;
                    const hasUnpaidFines = unpaidFines.length > 0;
                    
                    const shouldShowProcessFine = !hasFines;
                    const shouldShowFinished = hasFines && !hasUnpaidFines;
                    
                    return (
                      <>
                        {shouldShowProcessFine && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onProcessFine(item.id)}
                            disabled={actionLoading === item.id}
                            className="h-8 gap-1"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <DollarSign className="h-3.5 w-3.5" />
                            )}
                            Process Fine
                          </Button>
                        )}
                        {shouldShowFinished && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onFinish(item.id)}
                            disabled={actionLoading === item.id}
                            className="h-8 gap-1 bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            Finish
                          </Button>
                        )}
                      </>
                    );
                  })()}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(item.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
