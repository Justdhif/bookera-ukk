"use client";

import { BookReturn } from "@/types/book-return";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import FineStatusBadge from "@/components/custom-ui/badge/FineStatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Building2,
  Calendar,
  DollarSign,
  Hash,
  Receipt,
  Tag,
  User,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface ReturnBooksCardProps {
  bookReturn: BookReturn;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ReturnBooksCard({ bookReturn }: ReturnBooksCardProps) {
  const t = useTranslations("return");
  const tCommon = useTranslations("common");

  const fines = bookReturn.borrow?.fines ?? [];
  const totalFineAmount = fines.reduce((sum, fine) => sum + Number(fine.amount), 0);
  const outstandingFineAmount = fines
    .filter((fine) => fine.status === "unpaid")
    .reduce((sum, fine) => sum + Number(fine.amount), 0);

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              {t("returnedBooks")} ({bookReturn.details?.length ?? 0})
            </CardTitle>
            <CardDescription className="max-w-2xl">
              {t("borrowerLabel")}: {bookReturn.borrow?.user?.profile?.full_name ||
                bookReturn.borrow?.user?.email ||
                tCommon("noData")}
              {bookReturn.borrow?.borrow_code && (
                <span className="mx-2 text-muted-foreground">•</span>
              )}
              {bookReturn.borrow?.borrow_code && (
                <span className="font-mono font-medium text-foreground">
                  {t("borrowCodeLabel")}: 
                  {bookReturn.borrow.borrow_code}
                </span>
              )}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <BorrowStatusBadge status={bookReturn.borrow?.status ?? "open"} />
            <Badge variant="outline" className="font-mono text-[10px] border-dashed">
              Return #{bookReturn.id}
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              {format(new Date(bookReturn.return_date), "dd MMM yyyy")}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("borrowerLabel")}
            </p>
            <p className="mt-2 font-bold text-foreground">
              {bookReturn.borrow?.user?.profile?.full_name ||
                bookReturn.borrow?.user?.email ||
                tCommon("noData")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bookReturn.borrow?.user?.email || tCommon("noData")}
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("borrowCodeLabel")}
            </p>
            <p className="mt-2 font-mono text-sm font-bold text-foreground">
              {bookReturn.borrow?.borrow_code || `BRW-${bookReturn.borrow_id}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">#{bookReturn.borrow_id}</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("borrowDateLabel")}
            </p>
            <p className="mt-2 font-bold text-foreground">
              {bookReturn.borrow?.borrow_date
                ? format(new Date(bookReturn.borrow.borrow_date), "dd MMM yyyy")
                : tCommon("noData")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("scheduledCheckout")}</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("dueDateLabel")}
            </p>
            <p className="mt-2 font-bold text-destructive">
              {bookReturn.borrow?.return_date
                ? format(new Date(bookReturn.borrow.return_date), "dd MMM yyyy")
                : tCommon("noData")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("plannedReturn")}</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("returnDateLabel")}
            </p>
            <p className="mt-2 font-bold text-foreground">
              {format(new Date(bookReturn.return_date), "dd MMM yyyy")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("actualReturnRecord")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("returnedBooks")} <span className="text-primary">({bookReturn.details?.length ?? 0})</span>
            </h4>
          </div>

          <div className="grid gap-4">
            {bookReturn.details?.map((detail) => {
              const book = detail.book_copy?.book;
              const authors =
                book?.authors?.map((author) => author.name).join(", ") ||
                book?.author ||
                tCommon("noData");

              return (
                <div
                  key={detail.id}
                  className="group flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-premium sm:flex-row sm:items-start"
                >
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-20">
                    <Image
                      src={book?.cover_image || "/placeholder.png"}
                      alt={book?.title || "Book"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold tracking-tight group-hover:text-primary sm:text-lg">
                          {book?.title || tCommon("noData")}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-30">{authors}</span>
                          </div>
                          {book?.publishers && book.publishers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate max-w-30">
                                {book.publishers[0].name}
                              </span>
                            </div>
                          )}
                          {book?.isbn && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span className="truncate max-w-25">{book.isbn}</span>
                            </div>
                          )}
                          {book?.publication_year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{book.publication_year}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge
                          variant="secondary"
                          className="h-6 bg-muted/80 px-2.5 text-[11px] font-mono backdrop-blur border-border/50"
                        >
                          {detail.book_copy?.copy_code}
                        </Badge>
                      </div>
                    </div>

                    {book?.categories && book.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {book.categories.slice(0, 3).map((category) => (
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {fines.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                {t("finesTitle")} <span className="text-primary">({fines.length})</span>
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
                        {t("paidAt")} {format(new Date(fine.paid_at), "dd MMM yyyy HH:mm")}
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
                <p className="text-lg font-bold">Rp {totalFineAmount.toLocaleString("id-ID")}</p>
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
