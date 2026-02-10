"use client";

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
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function LostBooksTable({
  data,
  onDelete,
  onFinish,
}: {
  data: LostBook[];
  onDelete: (id: number) => void;
  onFinish: (id: number) => void;
}) {
  const router = useRouter();
  const t = useTranslations('admin.lostBooks');

  if (data.length === 0) {
    return (
      <EmptyState
        title={t('noLostBooksYet')}
        description={t('noLostBooksDesc')}
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
            <TableHead className="font-semibold">{t('borrower')}</TableHead>
            <TableHead className="font-semibold">{t('book')}</TableHead>
            <TableHead className="font-semibold">{t('loanId')}</TableHead>
            <TableHead className="font-semibold">{t('loanStatus')}</TableHead>
            <TableHead className="font-semibold">{t('lostDate')}</TableHead>
            <TableHead className="font-semibold">{t('notes')}</TableHead>
            <TableHead className="font-semibold text-right">{t('actions')}</TableHead>
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
                      {t('copyCodeLabel')}: {item.book_copy?.copy_code || "-"}
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
                      {t('unknownLostDate')}
                    </span>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {t('reportedAt')}{" "}
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
                    {t('noNotes')}
                  </span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex justify-end items-center gap-2">
                  {item.loan?.status === "checking" && (() => {
                    // Check if all fines are paid
                    const unpaidFines = item.loan?.fines?.filter((f: any) => f.status === "unpaid") || [];
                    const allFinesPaid = item.loan?.fines && item.loan.fines.length > 0 && unpaidFines.length === 0;
                    
                    return (
                      <>
                        {!allFinesPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/fines?loan_id=${item.loan_id}`)}
                            className="h-8 gap-1 text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          >
                            Process Fine
                          </Button>
                        )}
                        {allFinesPaid && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onFinish(item.id)}
                            className="h-8 gap-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
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
