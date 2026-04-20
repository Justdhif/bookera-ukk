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
import { BookOpen, Clock, Info, MessageCircle, Eye, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AddBookReviewDialog } from "../AddBookReviewDialog";
import { ReportLostDialog } from "../ReportLostDialog";
import Link from "next/link";
import { useState } from "react";

interface BorrowBooksCardProps {
  borrow: Borrow;
  onUpdate?: () => void;
}

export function BorrowBooksCard({
  borrow,
  onUpdate,
}: BorrowBooksCardProps) {
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

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-primary" />
              {showRequested ? t("requestedBooks") : t("borrowedBooks")} ({bookCount})
            </CardTitle>
            <CardDescription>
              {showRequested
                ? t("requestedBooksDesc")
                : t("manageReturnStatus")}
            </CardDescription>
          </div>
          {borrow.status === "open" && borrow.borrow_details?.some(d => d.status === "borrowed") && (
            <Button
              variant="destructive"
              onClick={() => setReportDialogOpen(true)}
              className="rounded-full px-6 font-bold gap-2 shadow-sm hover:scale-105 transition-all"
            >
              <AlertCircle className="h-4 w-4" />
              {tPublic("reportLostBook")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {hasAssignedCopies &&
            borrow.borrow_details.map((detail) => {
              const book = detail.book_copy?.book;
              const authors = book?.authors?.map(a => a.name).join(", ") || book?.author || tCommon("noAuthors");

              return (
                <div
                  key={detail.id}
                  className="p-6 transition-colors hover:bg-muted/5"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-1 flex gap-5">
                      <div className="relative group shrink-0">
                        <div className="relative w-24 h-36 rounded-xl overflow-hidden shadow-lg border border-primary/20 bg-muted">
                          <Image
                            src={book?.cover_image || "/placeholder.png"}
                            alt={book?.title || tCommon("bookCover")}
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            unoptimized
                          />
                        </div>
                        <Badge className="absolute -top-2 -right-2 shadow-md px-2 py-0.5 bg-background text-foreground border-2">
                          #{detail.book_copy?.copy_code}
                        </Badge>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-black text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {book?.title || tCommon("noData")}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-muted-foreground font-medium">{tCommon("from")}</span>
                            <span className="text-foreground font-bold underline decoration-primary/30 decoration-2 underline-offset-4">
                              {authors}
                            </span>
                            {book?.publishers && book.publishers.length > 0 && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground italic">
                                  {book.publishers[0].name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <BorrowDetailStatusBadge status={detail.status} />
                          {book?.categories && book.categories.length > 0 && (
                            <div className="flex gap-1.5 overflow-hidden">
                              {book.categories.slice(0, 2).map((cat: any) => (
                                <Badge key={cat.id} variant="secondary" className="text-[10px] uppercase font-bold tracking-tight py-0">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {detail.note && (
                          <div className="flex items-start gap-2.5 text-xs text-destructive bg-destructive/5 p-3 rounded-xl border border-destructive/20 max-w-sm">
                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                            <p className="font-semibold italic leading-relaxed">
                              {tCommon("note")}: {detail.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 md:pt-2">
                       {borrow.status === "close" && book && (
                        <AddBookReviewDialog 
                          bookId={book.id} 
                          bookTitle={book.title}
                          onSuccess={onUpdate}
                          trigger={
                            <Button variant="brand" size="sm" className="w-full sm:w-auto gap-2 font-bold shadow-sm">
                              <MessageCircle className="h-4 w-4" />
                              {tPublic("addReview")}
                            </Button>
                          }
                        />
                      )}
                      
                      <Link href={`/books/${book?.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 font-bold">
                          <Eye className="h-4 w-4" />
                          {tPublic("detailsBtn")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

          {showRequested &&
            requestedBooks.map((detail) => (
              <div
                key={detail.id}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 mx-6 my-3 hover:shadow-md transition-shadow"
              >
                <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm truncate">
                    {detail.book?.title || tCommon("noData")}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{t("pendingCopyAssignment")}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
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
