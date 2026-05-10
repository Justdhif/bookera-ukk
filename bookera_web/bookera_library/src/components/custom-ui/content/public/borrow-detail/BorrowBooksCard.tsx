"use client";

import { Borrow } from "@/types/borrow";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import BorrowDetailStatusBadge from "@/components/custom-ui/badge/BorrowDetailStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  Info,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AddBookReviewDialog } from "@/components/custom-ui/content/public/profile/me/borrow/AddBookReviewDialog";
import { ReportLostDialog } from "@/components/custom-ui/content/public/profile/me/borrow/ReportLostDialog";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import Link from "next/link";
import { useState } from "react";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";

interface BorrowBooksCardProps {
  borrow: Borrow;
  onUpdate?: () => void;
}

export function BorrowBooksCard({ borrow, onUpdate }: BorrowBooksCardProps) {
  const t = useTranslations("borrow");
  const tCommon = useTranslations("common");
  const tPublic = useTranslations("public");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const hasAssignedCopies = (borrow.borrow_details?.length ?? 0) > 0;
  const requestedBooks = borrow.borrow_request?.borrow_request_details ?? [];
  const showRequested = !hasAssignedCopies && requestedBooks.length > 0;
  const bookCount = hasAssignedCopies
    ? borrow.borrow_details.length
    : requestedBooks.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              {showRequested ? t("requestedBooks") : t("borrowedBooks")} (
              {bookCount})
            </CardTitle>
            <CardDescription className="max-w-2xl font-medium">
              {showRequested
                ? t("requestedBooksDesc")
                : t("manageReturnStatus")}
            </CardDescription>
          </div>
          {borrow.status === "open" &&
            borrow.borrow_details?.some((d) => d.status === "borrowed") && (
              <Button
                variant="destructive"
                onClick={() => setReportDialogOpen(true)}
                className="h-10 px-6 font-black gap-2 shadow-lg shadow-destructive/20 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <AlertCircle className="h-4 w-4" />
                {tPublic("reportLostBook")}
              </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <StaggerContainer className="divide-y divide-border/60">
          {hasAssignedCopies &&
            borrow.borrow_details.map((detail) => {
              const book = detail.book_copy?.book;
              const authors =
                book?.authors?.map((a) => a.name).join(", ") ||
                book?.author ||
                tCommon("noAuthors");
              const publisher =
                book?.publishers?.[0]?.name ||
                book?.publisher ||
                tCommon("noData");
              const categories = book?.categories ?? [];

              return (
                <SlideIn
                  key={detail.id}
                  direction="up"
                  distance={20}
                  className="p-6 lg:p-8 transition-colors hover:bg-muted/30"
                >
                  <div className="space-y-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                      <div className="relative group shrink-0 self-start">
                        <div className="relative h-36 w-24 overflow-hidden rounded-2xl border border-primary/20 bg-muted shadow-md">
                          <Image
                            src={book?.cover_image || "/placeholder-book.png"}
                            alt={book?.title || tCommon("bookCover")}
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            unoptimized
                          />
                        </div>
                        <Badge className="absolute -right-3 top-3 border-2 border-background bg-background px-2.5 py-0.5 font-semibold text-foreground shadow-md">
                          #{detail.book_copy?.copy_code}
                        </Badge>
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="line-clamp-2 text-xl font-black leading-tight text-foreground group-hover:text-primary transition-colors">
                            {book?.title || tCommon("noData")}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground">
                              {tCommon("from")}
                            </span>
                            <span className="font-semibold text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">
                              {authors}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="italic text-muted-foreground">
                              {publisher}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <BorrowDetailStatusBadge status={detail.status} />
                          {categories.slice(0, 2).map((cat: any) => (
                            <Badge
                              key={cat.id}
                              variant="secondary"
                              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>

                        {detail.note && (
                          <div className="flex max-w-xl items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            <p className="font-medium leading-relaxed italic">
                              <span className="font-bold">
                                {tCommon("note")}:
                              </span>{" "}
                              {detail.note}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row sm:flex-col items-center gap-3 shrink-0 self-end sm:self-start border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto justify-end">
                        {borrow.status === "close" && book && (
                          <AddBookReviewDialog
                            bookId={book.id}
                            bookTitle={book.title}
                            onSuccess={onUpdate}
                            trigger={
                              <Button
                                variant="brand"
                                size="sm"
                                className="h-9 px-4 font-bold gap-2 shadow-lg shadow-primary/20"
                              >
                                <MessageCircle className="h-4 w-4" />
                                {tPublic("addReview")}
                              </Button>
                            }
                          />
                        )}

                        <Link
                          href={`/books/${book?.slug}`}
                          target="_blank"
                          className="w-full sm:w-auto"
                        >
                          <DetailButton
                            label={tPublic("detailsBtn")}
                            className="w-full sm:w-auto font-black h-9 text-[10px] uppercase tracking-widest"
                          />
                        </Link>
                      </div>
                    </div>

                    {/* Status Processed (Returned/Lost) */}
                    {detail.status !== "borrowed" && (
                      <SlideIn
                        direction="up"
                        distance={10}
                        className="rounded-3xl border border-border/60 bg-background/80 px-4 py-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-foreground">
                              {t("processedAs", {
                                status: tCommon(detail.status),
                              })}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {tCommon(detail.status)}
                            </p>
                          </div>
                        </div>
                      </SlideIn>
                    )}

                    {/* Denda Per Buku (Late - only for active borrowed) */}
                    {borrow.status === "open" &&
                      detail.status === "borrowed" &&
                      borrow.estimated_late_fine?.is_late && (
                        <SlideIn
                          direction="up"
                          distance={10}
                          className="rounded-3xl border border-border/60 bg-muted/20 p-5 shadow-sm"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">
                                  <Clock className="h-4 w-4" />
                                  {borrow.estimated_late_fine.fine_name ||
                                    t("overdueAlertTitle")}
                                </p>
                                <p className="font-bold text-foreground">
                                  {t("lateFineInfo", {
                                    days: borrow.estimated_late_fine.days_late,
                                  })}
                                </p>
                              </div>
                              <span className="text-xl font-black text-rose-600">
                                {formatCurrency(
                                  borrow.estimated_late_fine.fine_per_book *
                                    borrow.estimated_late_fine.days_late,
                                )}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                              {borrow.estimated_late_fine.fine_description ||
                                t("overdueWarningNote")}
                            </p>
                          </div>
                        </SlideIn>
                      )}
                  </div>
                </SlideIn>
              );
            })}

          {showRequested &&
            requestedBooks.map((detail) => (
              <SlideIn
                key={detail.id}
                direction="up"
                distance={20}
                className="p-6 flex items-start gap-5 hover:bg-muted/30 transition-colors"
              >
                <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-lg font-black text-foreground truncate">
                    {detail.book?.title || tCommon("noData")}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{t("pendingCopyAssignment")}</span>
                  </div>
                </div>
              </SlideIn>
            ))}
        </StaggerContainer>
      </CardContent>
      <ReportLostDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        borrow={borrow}
        onSuccess={onUpdate}
      />
    </Card>
  );
}
