"use client";
import { useTranslations } from "next-intl";

import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LostBook } from "@/types/lost-book";
import EmptyState from "@/components/custom-ui/EmptyState";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import {
  AlertCircle,
  Trash,
  CheckCircle,
  BookOpen,
  Loader2,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface LostBooksTableProps {
  data: LostBook[];
  onDelete: (id: number) => void;
  onFinish: (id: number) => void;
  onProcessFine: (id: number) => void;
  actionLoading: number | null;
}

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Avatar className="size-8 shrink-0">
      {avatar && <AvatarImage src={avatar} alt={name} />}
      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  );
}

// Group lost books by borrow_id
function groupLostBooksByBorrow(lostBooks: LostBook[]) {
  const map = new Map<
    number,
    { borrow: LostBook["borrow"]; items: LostBook[] }
  >();
  for (const lb of lostBooks) {
    const borrowId = lb.borrow_id;
    if (!map.has(borrowId)) {
      map.set(borrowId, { borrow: lb.borrow, items: [] });
    }
    map.get(borrowId)!.items.push(lb);
  }
  return Array.from(map.values());
}

export default function LostBooksTable({
  data,
  onDelete,
  onFinish,
  actionLoading,
}: LostBooksTableProps) {
  const t = useTranslations("lost-books");
  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noLostBooks")}
        description={t("noLostBooksDesc")}
        icon={<AlertCircle />}
      />
    );
  }

  const grouped = groupLostBooksByBorrow(data);

  return (
    <div className="space-y-4">
      {grouped.map(({ borrow, items }, groupIndex) => {
        const borrowId = items[0]?.borrow_id;
        const borrowerName = borrow?.user?.profile?.full_name || "-";
        const borrowerEmail = borrow?.user?.email || "-";
        const borrowCode = borrow?.borrow_code;
        const avatarUrl = (borrow?.user?.profile as any)?.avatar;

        return (
          <div
            key={borrowId ?? groupIndex}
            className="border rounded-lg overflow-hidden"
          >
            {/* Borrow Parent Info */}
            <div className="bg-muted/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b">
              <div className="flex items-center gap-2.5">
                <UserAvatar name={borrowerName} avatar={avatarUrl} />
                <div>
                  <div className="text-sm font-semibold text-foreground leading-tight">
                    {borrowerName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {borrowerEmail}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  <Link
                    href={`/admin/borrows/${borrowCode ?? borrowId}`}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    {borrowCode ? borrowCode : `#${borrowId}`}
                  </Link>
                </span>
                <span><BorrowStatusBadge status={(borrow?.status as "open" | "close") ?? "close"} /></span>
              </div>
            </div>

            {/* Lost books for this borrow */}
            {items.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground italic">
                No lost books recorded for this borrow.
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* table-fixed + colgroup agar kolom sejajar antar grup */}
                <Table className="table-fixed w-full">
                  <colgroup>
                    <col className="w-12" />
                    <col className="w-65" />
                    <col className="w-40" />
                    <col />
                    <col className="w-30" />
                  </colgroup>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="text-center">#</TableHead>
                      <TableHead className="font-semibold">{t("bookCol")}</TableHead>
                      <TableHead className="font-semibold">{t("dateLostCol")}</TableHead>
                      <TableHead className="font-semibold">
                        {t("notes")}
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        {t("actionsCol")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const isLoading = actionLoading === item.id;
                      const fines = item.borrow?.fines ?? [];
                      const hasUnpaidFines = fines.some(
                        (f: any) => f.status === "unpaid",
                      );
                      const canFinish =
                        borrow?.status === "open" &&
                        fines.length > 0 &&
                        !hasUnpaidFines;

                      return (
                        <TableRow
                          key={item.id}
                          className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
                        >
                          <TableCell className="font-medium text-center text-muted-foreground">
                            {index + 1}
                          </TableCell>

                          {/* Book */}
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {item.book_copy?.book?.title || "-"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.book_copy?.copy_code || "-"}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Date Lost */}
                          <TableCell>
                            <div className="text-sm">
                              {item.estimated_lost_date ? (
                                <div className="text-foreground">
                                  {format(
                                    new Date(item.estimated_lost_date),
                                    "dd MMM yyyy",
                                    { locale: localeId },
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-xs">
                                  {t("unknownDate")}
                                </span>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {t("reportedLabel")}{" "}
                                {format(
                                  new Date(item.created_at),
                                  "dd MMM yyyy",
                                  {
                                    locale: localeId,
                                  },
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Notes */}
                          <TableCell>
                            {item.notes ? (
                              <p className="text-sm text-muted-foreground truncate">
                                {item.notes}
                              </p>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">
                                {t("noNotes")}
                              </span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex justify-end items-center gap-1.5">
                              {canFinish && (
                                <Button
                                  size="sm"
                                  onClick={() => onFinish(item.id)}
                                  disabled={isLoading}
                                  className="h-8 gap-1 bg-green-600 hover:bg-green-700 text-white" variant="brand"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {t("finishBtn")}
                                  </span>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(item.id)}
                                disabled={isLoading}
                                className="h-8 gap-1"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{t("deleteBtn")}</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
