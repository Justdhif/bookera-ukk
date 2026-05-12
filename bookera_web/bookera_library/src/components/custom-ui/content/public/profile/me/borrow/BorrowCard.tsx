"use client";
import { Borrow } from "@/types/borrow";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScaleIn } from "@/components/custom-ui/motion";
import { useRouter } from "next/navigation";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { AddBookReviewDialog } from "./AddBookReviewDialog";

interface BorrowCardProps {
  borrow: Borrow;
  index?: number;
}

const MAX_VISIBLE_BOOKS = 3;

export function BorrowCard({ borrow, index = 0 }: BorrowCardProps) {
  const t = useTranslations("borrow");
  const tp = useTranslations("public");
  const tCommon = useTranslations("common");
  const router = useRouter();

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <ScaleIn delay={index * 0.06}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`borrow-${borrow.id}-${index}`}
          className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4 px-0 border-b-0"
        >
          <AccordionTrigger className="w-full text-left p-5 hover:no-underline [&>svg]:mr-0 [&>svg]:h-5 [&>svg]:w-5 cursor-pointer">
            <div className="flex items-start gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <BookOpen className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-foreground">
                    {tp("borrowHash")}
                    {borrow.borrow_code}
                  </p>
                  <div className="shrink-0">
                    <BorrowStatusBadge
                      status={borrow.status}
                      className="h-5 px-2 text-[9px] font-black uppercase tracking-wider"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("borrowDate")}:{" "}
                      <span className="text-foreground font-medium">
                        {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("returnDate")}:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          isOverdue ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {format(returnDate, "dd MMM yyyy")}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="mx-5 h-px bg-border/60" />
            <div className="p-5 space-y-6">
              {/* Section 1: Books */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("booksBorrowed")}
                </h4>
                <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                  {groupedBooks.map((item: any) => {
                    const { book, quantity } = item;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 hover:bg-muted/20 transition-colors"
                      >
                        {book?.cover_image ? (
                          <div className="relative shrink-0 shadow-sm">
                            <Image
                              src={book.cover_image}
                              alt={book.title}
                              width={40}
                              height={56}
                              className="h-14 w-10 rounded-md object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border/50">
                            <BookOpen className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-foreground line-clamp-1">
                            {book?.title || "-"}
                            {quantity > 1 && (
                              <span className="ml-2 text-[10px] font-black text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                                x{quantity}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight truncate">
                            {book?.author || "-"}
                          </p>
                          {borrow.status === "close" && book && (
                            <AddBookReviewDialog 
                              bookId={book.id} 
                              bookTitle={book.title}
                              trigger={
                                <button className="text-[10px] font-bold text-brand-primary hover:underline mt-1">
                                  {tp("addReview")}
                                </button>
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Fine Info if exists */}
              {hasFineData && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                    {t("fineInfo")}
                  </h4>
                  <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                    {fines.map((f) => (
                      <div
                        key={f.id}
                        className="flex justify-between items-center p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-foreground truncate">
                            {f.fine_type?.name || t("fine")}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] uppercase font-black tracking-widest",
                              f.status === "paid"
                                ? "text-emerald-600"
                                : "text-destructive"
                            )}
                          >
                            {f.status === "paid" ? tCommon("paid") : tCommon("unpaid")}
                          </span>
                        </div>
                        <span className="text-sm font-black text-foreground">
                          {formatCurrency(Number(f.amount))}
                        </span>
                      </div>
                    ))}

                    {isLate && estimatedFine && (
                      <div className="flex justify-between items-center p-3 bg-destructive/5">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-destructive truncate">
                            {t("estimatedLateFine")}
                          </span>
                          <span className="text-[9px] uppercase font-black text-destructive/70 tracking-widest">
                            {estimatedFine.days_late} {t("days")}
                          </span>
                        </div>
                        <span className="text-sm font-black text-destructive">
                          {formatCurrency(estimatedFine.total_fine)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>

          <div className="mx-5 h-px bg-border/60" />

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("totalBooks")}
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-brand-primary">
                {t("bookUnit", { count: totalItemsCount })}
              </p>
            </div>

            {borrow.borrow_code && (
              <Link href={detailLink}>
                <DetailButton label={tCommon("view")} />
              </Link>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </ScaleIn>
  );
}


