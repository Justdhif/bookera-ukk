"use client";

import { Borrow } from "@/types/borrow";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth.store";
import { AddBookReviewDialog } from "./AddBookReviewDialog";

interface BorrowCardProps {
  borrow: Borrow;
}

const MAX_VISIBLE_BOOKS = 2;

export function BorrowCard({ borrow }: BorrowCardProps) {
  const t = useTranslations("borrow");
  const tp = useTranslations("public");
  const tCommon = useTranslations("common");
  const userSlug = useAuthStore((state) => state.user?.slug);

  const borrowDetails = borrow.borrow_details || [];
  
  // Try to use grouped_details from backend, fallback to manual grouping if missing
  const groupedBooks = borrow.grouped_details || borrowDetails.map(d => ({
    id: d.id,
    book: d.book_copy?.book,
    quantity: 1,
    status: d.status,
    copy_code: d.book_copy?.copy_code
  }));
  
  const totalItemsCount = borrowDetails.length;

  const visibleBooks = groupedBooks.slice(0, MAX_VISIBLE_BOOKS);
  const hiddenCount = Math.max(0, groupedBooks.length - MAX_VISIBLE_BOOKS);

  const returnDate = new Date(borrow.return_date);
  const isOverdue = borrow.status === "open" && returnDate < new Date();

  const detailLink = `/borrow/${borrow.borrow_code}`;

  // Fine Calculation
  const fines = borrow.fines || [];
  const actualFineAmount = fines.reduce((acc, f) => acc + Number(f.amount), 0);
  const unpaidFineAmount = fines.filter(f => f.status === "unpaid").reduce((acc, f) => acc + Number(f.amount), 0);
  
  const hasUnpaidFine = fines.some(f => f.status === "unpaid");
  const isAllPaid = fines.length > 0 && fines.every(f => f.status === "paid");

  const estimatedFine = borrow.estimated_late_fine;
  const isLate = isOverdue && estimatedFine && estimatedFine.is_late;
  
  const displayFineAmount = isLate ? estimatedFine.total_fine : (hasUnpaidFine ? unpaidFineAmount : actualFineAmount);
  const hasFineData = fines.length > 0 || isLate;

  return (
    <Card className="transition-all duration-200 overflow-hidden relative group border-border/40 p-0 shadow-sm hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-stretch min-h-[160px]">
          {/* ── Col 1: BUKU YANG DIPINJAM ── */}
          <div className="flex-1 p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              {t("booksBorrowed")}
            </p>

            {groupedBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground italic font-medium">
                  {tCommon("noData")}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {visibleBooks.map((item: any) => {
                    const { book, quantity } = item;
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 group/book"
                      >
                        {book?.cover_image ? (
                          <div className="relative shrink-0 shadow-sm group-hover/book:shadow-md transition-all">
                            <Image
                              src={book.cover_image}
                              alt={book.title}
                              width={48}
                              height={64}
                              className="h-16 w-12 rounded-lg object-cover transition-transform group-hover/book:scale-105"
                              unoptimized
                            />
                            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5" />
                          </div>
                        ) : (
                          <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50 shadow-sm">
                            <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <p className="font-bold leading-tight text-sm text-foreground line-clamp-1 group-hover/book:text-primary transition-colors">
                                {book?.title || "-"}
                              </p>
                              {quantity > 1 && (
                                <span className="text-xs font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                                  x{quantity}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-muted-foreground/80 truncate uppercase tracking-tight">
                              {book?.author || "-"}
                            </p>
                            
                            {borrow.status === "close" && book && (
                              <AddBookReviewDialog 
                                bookId={book.id} 
                                bookTitle={book.title}
                                trigger={
                                  <button className="text-[10px] font-bold text-primary hover:text-primary/80 underline underline-offset-2 transition-colors mt-1">
                                    {tp("addReview")}
                                  </button>
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {hiddenCount > 0 && (
                    <div className="flex items-center gap-3 pl-[60px]">
                      <div className="h-[2px] w-4 bg-border/40 rounded-full" />
                      <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        +{hiddenCount} {t("otherBooks")}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex py-5">
            <Separator orientation="vertical" className="h-full bg-border/60" />
          </div>
          <Separator orientation="horizontal" className="md:hidden mx-5 w-auto" />

          {/* ── Col 2: INFO PEMINJAMAN ── */}
          <div className="flex-1 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {t("borrowInfo")}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <BorrowStatusBadge
                  status={borrow.status}
                  className="h-6 px-2.5 text-[10px] font-black uppercase tracking-wider shadow-xs"
                />
                {borrow.borrow_code && (
                  <Link href={detailLink}>
                    <DetailButton
                      label={tCommon("view")}
                      className="h-7 px-3 text-[11px] font-bold"
                    />
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/20 border border-border/5">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <div className="p-1 rounded-lg bg-background shadow-xs">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider">
                    {t("borrowDate")}
                  </span>
                </div>
                <span className="font-bold text-foreground tracking-tight">
                  {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/20 border border-border/5">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <div className="p-1 rounded-lg bg-background shadow-xs">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider">
                    {t("returnDate")}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-bold tracking-tight",
                    isOverdue ? "text-red-500 animate-pulse" : "text-foreground"
                  )}
                >
                  {format(returnDate, "dd MMM yyyy")}
                </span>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-4 rounded-2xl bg-brand-primary/30 px-5 py-4 border-2 border-brand-primary shadow-lg shadow-brand-primary/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner ring-1 ring-white/30">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none">
                  {t("totalBooks")}
                </p>
                <div className="text-2xl font-black leading-none text-white flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-white uppercase tracking-wider">
                    {t("bookUnit", { count: totalItemsCount })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex py-5">
            <Separator orientation="vertical" className="h-full bg-border/60" />
          </div>
          <Separator orientation="horizontal" className="md:hidden mx-5 w-auto" />

          {/* ── Col 3: INFO DENDA ── */}
          <div className="flex-1 p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              {t("fineInfo")}
            </p>

            <div className="space-y-2.5">
              {!hasFineData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-dashed border-border/40 bg-muted/5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500/30 mb-2" />
                  <p className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                    {tCommon("noFines")}
                  </p>
                </div>
              ) : (
                <>
                  <div className={cn(
                    "flex flex-col gap-3 p-3 rounded-2xl border transition-all duration-300",
                    (hasUnpaidFine || isLate) 
                      ? "bg-destructive/5 border-destructive/10" 
                      : "bg-emerald-500/5 border-emerald-500/10"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className={cn(
                          "h-3.5 w-3.5",
                          (hasUnpaidFine || isLate) ? "text-destructive" : "text-emerald-600"
                        )} />
                        <p className="text-[10px] font-black uppercase tracking-[0.15em]">
                          {(hasUnpaidFine || isLate) ? (isLate ? t("overdue") : tCommon("unpaid")) : tCommon("total")}
                        </p>
                      </div>
                      {isLate && estimatedFine?.days_late && (
                        <span className="text-[9px] font-bold text-destructive/70 bg-destructive/10 px-1.5 py-0.5 rounded-md">
                          {estimatedFine.days_late} {t("days")}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-lg font-black tracking-tight",
                        (hasUnpaidFine || isLate) ? "text-destructive dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        Rp {new Intl.NumberFormat("id-ID").format(displayFineAmount)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

