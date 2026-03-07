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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Fine } from "@/types/fine";
import EmptyState from "@/components/custom-ui/EmptyState";
import { DollarSign, Trash, Eye, BookOpen, Hash } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const statusColors: Record<string, string> = {
  unpaid:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200",
  waived:
    "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 border-gray-200",
};

const getStatusLabels = (t: any): Record<string, string> => ({
  unpaid: t("unpaid"),
  paid: t("paid"),
  waived: t("waived"),
});

function groupFinesByBorrow(fines: Fine[]) {
  const map = new Map<number, { borrow: Fine["borrow"]; fines: Fine[] }>();
  for (const fine of fines) {
    const borrowId = fine.borrow_id;
    if (!map.has(borrowId)) {
      map.set(borrowId, { borrow: fine.borrow, fines: [] });
    }
    map.get(borrowId)!.fines.push(fine);
  }
  return Array.from(map.values());
}

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const t = useTranslations("fines");
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

export default function FineTable({
  data,
  onDelete,
}: {
  data: Fine[];
  onDelete: (id: number) => void;
}) {
  const t = useTranslations("fines");
  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noFines")}
        description={t("noFinesDesc")}
        icon={<DollarSign className="h-10 w-10" />}
      />
    );
  }

  const grouped = groupFinesByBorrow(data);

  return (
    <div className="space-y-4">
      {grouped.map(({ borrow, fines }, groupIndex) => {
        const borrowId = fines[0]?.borrow_id;
        const borrowerName = borrow?.user?.profile?.full_name || "-";
        const borrowerEmail = borrow?.user?.email || "-";
        const borrowCode = borrow?.borrow_code;
        const avatarUrl = (borrow?.user?.profile as any)?.avatar;

        const books =
          borrow?.borrow_details
            ?.map((d) => d.book_copy?.book?.title)
            .filter(Boolean) ?? [];

        return (
          <div
            key={borrowId ?? groupIndex}
            className="border rounded-lg overflow-hidden"
          >
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
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {books.length > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    {books.slice(0, 2).join(", ")}
                    {books.length > 2 && ` +${books.length - 2} more`}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs">
                  <Hash className="h-3.5 w-3.5" />
                  <Link
                    href={`/admin/borrows/${borrowCode ?? borrowId}`}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    {borrowCode ? borrowCode : `#${borrowId}`}
                  </Link>
                </span>
              </div>
            </div>

            {fines.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground italic">
                No fines recorded for this borrow.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                  <colgroup>
                    <col className="w-12" />
                    <col className="w-55" />
                    <col className="w-35" />
                    <col className="w-27.5" />
                    <col className="w-40" />
                    <col className="w-37.5" />
                  </colgroup>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="text-center">#</TableHead>
                      <TableHead className="font-semibold">
                        {t("fineType")}
                      </TableHead>
                      <TableHead className="font-semibold">
                        {t("amount")}
                      </TableHead>
                      <TableHead className="font-semibold">
                        {t("status")}
                      </TableHead>
                      <TableHead className="font-semibold">
                        {t("date")}
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        {t("actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fines.map((item, index) => (
                      <TableRow
                        key={item.id}
                        className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
                      >
                        <TableCell className="font-medium text-center text-muted-foreground">
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-foreground">
                            {item.fine_type?.name || "-"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold text-foreground">
                            Rp {item.amount.toLocaleString("id-ID")}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[item.status]}
                          >
                            {getStatusLabels(t)[item.status]}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div className="text-muted-foreground">
                              {format(
                                new Date(item.created_at),
                                "dd MMM yyyy",
                                {
                                  locale: localeId,
                                },
                              )}
                            </div>
                            {item.paid_at && (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                {t("paid")}{" "}
                                {format(new Date(item.paid_at), "dd MMM yyyy", {
                                  locale: localeId,
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end items-center gap-1.5">
                            <Link
                              href={`/admin/borrows/${borrowCode ?? item.borrow_id}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Details
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => onDelete(item.id)}
                            >
                              <Trash className="h-3.5 w-3.5 mr-1" />
                              <span className="hidden sm:inline">
                                {t("delete")}
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
