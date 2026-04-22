"use client";

import { LostBook } from "@/types/lost-book";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
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
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  Hash,
  Loader2,
  Receipt,
  Tag,
  Trash,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface LostBookCardProps {
  borrow: LostBook["borrow"];
  items: LostBook[];
  onDelete: (id: number) => void;

  actionLoading: number | null;
}

type LostEntry = {
  key: string;
  itemId: number;
  lost_date?: string;
  notes?: string;
  bookTitle?: string;
  authors: string;
  publishers: string[];
  categories: Array<{ id: number; name: string }>;
  isbn?: string;
  publicationYear?: number;
  coverImage?: string;
  copyCode?: string;

};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}



export function LostBookCard({
  borrow,
  items,
  onDelete,
  actionLoading,
}: LostBookCardProps) {
  const t = useTranslations("lost-books");
  const tCommon = useTranslations("common");

  const borrowId = items[0]?.borrow_id;
  const fines = (borrow?.fines ?? []) as any[];
  const hasUnpaidFines = fines.some((f) => f.status === "unpaid");
  const totalFineAmount = fines.reduce((sum, f) => sum + Number(f.amount), 0);
  const outstandingFineAmount = fines
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + Number(f.amount), 0);

  const detailLink = borrow?.borrow_code
    ? `/admin/borrows/${borrow.borrow_code}`
    : borrowId
      ? `/admin/borrows/${borrowId}`
      : null;

  const lostEntries: LostEntry[] = items.flatMap((item) => {
    const details = item.details || [];

    return details.map((detail) => {
      const book = detail.book_copy?.book || item.book_copy?.book;
      return {
        key: `${item.id}-${detail.id}`,
        itemId: item.id,
        lost_date: detail.lost_date,
        notes: detail.notes ?? item.notes,
        bookTitle: book?.title,
        authors:
          book?.authors?.map((a: any) => a.name).join(", ") ||
          book?.author ||
          tCommon("noData"),
        publishers: book?.publishers?.map((p: any) => p.name) || [],
        categories: book?.categories ?? [],
        isbn: book?.isbn,
        publicationYear: book?.publication_year,
        coverImage: book?.cover_image,
        copyCode: detail.book_copy?.copy_code || item.book_copy?.copy_code,

      };
    });
  });

  const latestLostDate = items
    .flatMap((item) => item.details || [])
    .map((d) => d.lost_date)
    .filter((d): d is string => !!d)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-premium">
      <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl font-bold tracking-tight">
                {t("borrowLabel")} #{borrowId}
              </CardTitle>
              <BorrowStatusBadge status={(borrow?.status as "open" | "close") ?? "open"} />
              <Badge variant="outline" className="text-[10px] font-mono border-dashed">
                {borrow?.borrow_code}
              </Badge>
              {latestLostDate && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {format(new Date(latestLostDate), "dd MMM yyyy")}
                </Badge>
              )}
            </div>
            <CardDescription className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-foreground/80">
                <User className="h-3.5 w-3.5 text-primary" />
                {t("borrowerLabel")}:{" "}
                {borrow?.user?.profile?.full_name ||
                  borrow?.user?.email ||
                  tCommon("noData")}
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {t("borrowDateLabel")}:{" "}
                {borrow?.borrow_date
                  ? format(new Date(borrow.borrow_date), "dd MMM yyyy")
                  : tCommon("noData")}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-destructive/5 px-2 py-0.5 text-destructive">
                <Calendar className="h-3.5 w-3.5" />
                {t("dueDateLabel")}:{" "}
                {borrow?.return_date
                  ? format(new Date(borrow.return_date), "dd MMM yyyy")
                  : tCommon("noData")}
              </span>
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertCircle className="mr-1 h-3.5 w-3.5" />
              {lostEntries.length} {t("lostBooksCount")}
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              <DollarSign className="mr-1 h-3.5 w-3.5" />
              Rp {totalFineAmount.toLocaleString("id-ID")}
            </Badge>
            {outstandingFineAmount > 0 && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                <Receipt className="mr-1 h-3.5 w-3.5" />
                Rp {outstandingFineAmount.toLocaleString("id-ID")}
              </Badge>
            )}
            {detailLink && (
              <Link href={detailLink}>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("viewBtn")}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Lost book entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              {t("lostBooksSection")}{" "}
              <span className="text-destructive">({lostEntries.length})</span>
            </h4>
          </div>

          <div className="grid gap-4">
            {lostEntries.map((entry) => {
              const isLoading = actionLoading === entry.itemId;
              return (
                <div
                  key={entry.key}
                  className="group/item flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-destructive/30 hover:shadow-premium sm:flex-row sm:items-start"
                >
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover/item:scale-105 sm:h-28 sm:w-20">
                    <Image
                      src={entry.coverImage || "/placeholder.png"}
                      alt={entry.bookTitle || "Book"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold tracking-tight group-hover/item:text-destructive sm:text-lg">
                          {entry.bookTitle || tCommon("noData")}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-30">{entry.authors}</span>
                          </div>
                          {entry.publishers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate max-w-30">{entry.publishers[0]}</span>
                            </div>
                          )}
                          {entry.isbn && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span className="truncate max-w-25">{entry.isbn}</span>
                            </div>
                          )}
                          {entry.publicationYear && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{entry.publicationYear}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge
                          variant="secondary"
                          className="h-6 bg-muted/80 px-2.5 text-[11px] font-mono backdrop-blur border-border/50"
                        >
                          {entry.copyCode}
                        </Badge>
                        {entry.lost_date ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                            {format(new Date(entry.lost_date), "dd MMM yyyy")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-dashed text-[10px] text-muted-foreground"
                          >
                            {t("unknownDate")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {entry.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {entry.categories.slice(0, 3).map((category) => (
                          <Badge
                            key={category.id}
                            variant="outline"
                            className="h-6 border-primary/20 bg-primary/5 px-2.5 py-0 text-[10px] font-medium text-primary/80"
                          >
                            <Tag className="mr-1.5 h-3 w-3" />
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-sm italic text-muted-foreground border-l-2 border-destructive/30 pl-3">
                        {entry.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(entry.itemId)}
                        disabled={isLoading}
                        className="h-8 gap-1"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span>{t("deleteBtn")}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fines section — identical to ReturnCard */}
        {fines.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                {t("finesTitle")}{" "}
                <span className="text-primary">({fines.length})</span>
              </h4>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <DollarSign className="mr-1 h-3.5 w-3.5" />
                Rp {totalFineAmount.toLocaleString("id-ID")}
              </Badge>
            </div>

            <div className="grid gap-4">
              {fines.map((fine) => (
                <div
                  key={fine.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1.5">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {fine.fine_type?.name || t("fine")}
                    </p>
                    <p className="text-2xl font-black tracking-tight text-foreground">
                      {formatCurrency(Number(fine.amount))}
                    </p>
                    {fine.fine_type?.description && (
                      <p className="max-w-2xl text-sm font-medium text-muted-foreground/80">
                        {fine.fine_type.description}
                      </p>
                    )}
                    {fine.notes && (
                      <p className="max-w-2xl text-sm font-medium text-muted-foreground/80">
                        {fine.notes}
                      </p>
                    )}
                    {fine.paid_at && (
                      <p className="text-xs text-emerald-600">
                        {t("paidAt")}{" "}
                        {format(new Date(fine.paid_at), "dd MMM yyyy HH:mm")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <FineStatusBadge status={fine.status} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("totalFinesLabel")}</p>
                <p className="text-lg font-bold">
                  Rp {totalFineAmount.toLocaleString("id-ID")}
                </p>
              </div>
              {outstandingFineAmount > 0 && (
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">{t("outstandingLabel")}</p>
                  <p className="text-lg font-bold text-destructive">
                    Rp {outstandingFineAmount.toLocaleString("id-ID")}
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
