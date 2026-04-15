"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { toast } from "sonner";
import { borrowRequestService } from "@/services/borrow-request.service";
import { publicService } from "@/services/public.service";
import { Book } from "@/types/book";
import Image from "next/image";
import { BookOpen, Building2, Star, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BorrowRequestDialogProps {
  bookIds: number[];
  initialBooks?: Book[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BorrowRequestDialog({
  bookIds,
  initialBooks = [],
  isOpen,
  onClose,
  onSuccess,
}: BorrowRequestDialogProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loading, setLoading] = useState(false);

  const uniqueBookIds = Array.from(new Set(bookIds));

  const handleClose = () => {
    onClose();
    setBorrowDate(undefined);
    setReturnDate(undefined);
    setSelectedBooks([]);
  };

  const isSubmitDisabled =
    loading ||
    loadingBooks ||
    uniqueBookIds.length === 0 ||
    selectedBooks.length < uniqueBookIds.length ||
    !borrowDate ||
    !returnDate ||
    returnDate <= borrowDate ||
    selectedBooks.some((book) => (book.available_copies ?? 0) === 0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const loadSelectedBooks = async () => {
      if (bookIds.length === 0) {
        setSelectedBooks([]);
        setLoadingBooks(false);
        return;
      }

      const cachedBooks = uniqueBookIds
        .map((bookId) => initialBooks.find((book) => book.id === bookId))
        .filter((book): book is Book => Boolean(book));

      if (cachedBooks.length > 0) {
        setSelectedBooks(cachedBooks);
      }

      const missingBookIds = uniqueBookIds.filter(
        (bookId) => !cachedBooks.some((book) => book.id === bookId),
      );

      if (missingBookIds.length === 0) {
        setLoadingBooks(false);
        return;
      }

      setLoadingBooks(true);
      try {
        const responses = await Promise.all(
          missingBookIds.map((bookId) => publicService.getBookById(bookId)),
        );

        if (!cancelled) {
          const fetchedBooks = responses.map((response) => response.data.data);
          const mergedBooks = uniqueBookIds
            .map(
              (bookId) =>
                cachedBooks.find((book) => book.id === bookId) ??
                fetchedBooks.find((book) => book.id === bookId),
            )
            .filter((book): book is Book => Boolean(book));
          setSelectedBooks(mergedBooks);
        }
      } catch (error) {
        console.error("Failed to load selected books:", error);
        if (!cancelled) {
          setSelectedBooks([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBooks(false);
        }
      }
    };

    loadSelectedBooks();

    return () => {
      cancelled = true;
    };
  }, [bookIds, initialBooks, isOpen]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (bookIds.length === 0) {
      toast.error(t("detail.selectOne") || "Please select at least one book");
      return;
    }

    if (!borrowDate) {
      toast.error(t("borrowDateRequired") || "Borrow date is required");
      return;
    }
    if (!returnDate) {
      toast.error(t("common.returnDateRequired") || "Return date is required");
      return;
    }
    if (returnDate <= borrowDate) {
      toast.error(t("returnDateMustBeAfter") || "Return date must be after borrow date");
      return;
    }

    try {
      setLoading(true);
      await borrowRequestService.create({
        book_ids: bookIds,
        borrow_date: format(borrowDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
      });
      toast.success(t("common.borrowRequestSubmitted") || "Borrow request created successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("common.failedToBorrow") || "Failed to create borrow request",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl sm:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("borrowRequestTitle")}</DialogTitle>
            <DialogDescription>
              {uniqueBookIds.length > 1
                ? `${t("borrowRequestDesc")} (${uniqueBookIds.length} ${t("books")})`
                : t("borrowRequestDesc")}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="space-y-5">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-foreground">
                  {tCommon("booksSelected")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("borrowRequestDesc")}
                </p>
              </div>

              <div className="inline-flex min-w-10 items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {uniqueBookIds.length}
              </div>
            </div>

            {loadingBooks && selectedBooks.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                <div className="h-16 w-12 shrink-0 animate-pulse rounded-xl bg-muted" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            ) : selectedBooks.length > 0 ? (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {selectedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-background/80 p-3 shadow-sm transition-colors hover:border-primary/30"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={book.cover_image ?? "/placeholder.png"}
                        alt={book.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {book.title}
                      </p>
                      {book.author && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3 shrink-0" />
                          <span className="truncate">{book.author}</span>
                        </div>
                      )}
                      {book.publisher && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{book.publisher}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-1">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "h-6 px-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border-none",
                            (book.available_copies ?? 0) > 0 
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]" 
                              : "bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.15)] animate-pulse"
                          )}
                        >
                          {(book.available_copies ?? 0) > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                              {t("stockAvailable", { count: book.available_copies ?? 0 })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              {t("outOfStock")}
                            </div>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                      <Star className="h-3 w-3 fill-current" />
                      {book.average_rating ? Number(book.average_rating).toFixed(1) : "0.0"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                {tCommon("noBooksSelected")}
              </div>
            )}
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label variant="required">{t("borrowDateLabel")}</Label>
              <DatePicker
                value={borrowDate}
                onChange={setBorrowDate}
                placeholder={t("selectBorrowDate")}
                dateMode="future"
              />
            </div>

            <div className="space-y-2">
              <Label variant="required">{t("returnDateLabel")}</Label>
              <DatePicker
                value={returnDate}
                onChange={setReturnDate}
                placeholder={t("selectReturnDate")}
                dateMode="future"
              />
              <p className="text-xs text-muted-foreground">
                {t("returnDateMustBeAfter")}
              </p>
            </div>
          </div>

          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t("detail.editDialog.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              loading={loading || loadingBooks}
              variant="submit"
            >
              {loading 
                ? t("processingBtn") 
                : loadingBooks
                  ? tCommon("loading")
                  : selectedBooks.length > 0 && selectedBooks.some(book => (book.available_copies ?? 0) === 0)
                    ? t("outOfStock")
                    : t("submitRequest")}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
