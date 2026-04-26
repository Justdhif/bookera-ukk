"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo, useRef } from "react";
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
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { borrowRequestService } from "@/services/borrow-request.service";
import { publicService } from "@/services/public.service";
import { Book } from "@/types/book";
import Image from "next/image";
import {
  BookOpen,
  Building2,
  Star,
  AlertCircle,
  Calendar,
  Minus,
  Plus,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import DataLoading from "@/components/custom-ui/DataLoading";

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
  const { user, fetchUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const hasPendingRequest = user?.has_pending_borrow_request ?? false;

  const uniqueBookIdsStr = JSON.stringify(bookIds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uniqueBookIds = useMemo(
    () => Array.from(new Set(bookIds)),
    [uniqueBookIdsStr],
  );

  const initialBooksRef = useRef(initialBooks);
  useEffect(() => {
    initialBooksRef.current = initialBooks;
  }, [initialBooks]);

  useEffect(() => {
    setQuantities((prev) => {
      const next = { ...prev };
      uniqueBookIds.forEach((id) => {
        if (!next[id]) next[id] = 1;
      });
      return next;
    });
  }, [uniqueBookIds]);

  const handleQuantityChange = (bookId: number, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[bookId] || 1;
      const next = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [bookId]: next };
    });
  };

  const handleClose = () => {
    onClose();
    setBorrowDate(undefined);
    setReturnDate(undefined);
    setSelectedBooks([]);
    setLoading(false);
    setLoadingBooks(false);
  };

  const isDataLoading = loadingBooks || checkingUser;

  const isSubmitDisabled =
    loading ||
    isDataLoading ||
    hasPendingRequest ||
    uniqueBookIds.length === 0 ||
    selectedBooks.length < uniqueBookIds.length ||
    !borrowDate ||
    selectedBooks.some((book) => (book.available_copies ?? 0) === 0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      if (!isOpen || !isAuthenticated) return;

      setCheckingUser(true);
      await fetchUser();
      if (cancelled) return;
      setCheckingUser(false);

      const cachedBooks = initialBooksRef.current.filter((book) =>
        uniqueBookIds.includes(book.id),
      );

      if (cachedBooks.length >= uniqueBookIds.length) {
        setSelectedBooks(cachedBooks);
        setLoadingBooks(false);
        return;
      }

      if (cachedBooks.length > 0) {
        setSelectedBooks(cachedBooks);
      }

      const missingBookIds = uniqueBookIds.filter(
        (bookId) => !cachedBooks.some((book) => book.id === bookId),
      );

      setLoadingBooks(true);
      try {
        const responses = await Promise.all(
          missingBookIds.map((bookId) => publicService.getBookById(bookId)),
        );

        if (!cancelled) {
          const fetchedBooks = responses.map(
            (response: any) => response.data.data,
          );
          const mergedBooks = uniqueBookIds
            .map(
              (bookId) =>
                cachedBooks.find((book: Book) => book.id === bookId) ??
                fetchedBooks.find((book: Book) => book.id === bookId),
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, [uniqueBookIdsStr, isOpen, isAuthenticated, fetchUser]);

  useEffect(() => {
    if (borrowDate) {
      setReturnDate(addDays(borrowDate, 5));
    } else {
      setReturnDate(undefined);
    }
  }, [borrowDate]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (bookIds.length === 0) {
      toast.error(t("detail.selectOne"));
      return;
    }

    if (!borrowDate) {
      toast.error(t("borrowDateRequired"));
      return;
    }
    if (!returnDate) {
      toast.error(t("common.returnDateRequired"));
      return;
    }
    if (returnDate <= borrowDate) {
      toast.error(t("returnDateMustBeAfter"));
      return;
    }

    try {
      setLoading(true);
      const borrowItems = uniqueBookIds.map((id) => ({
        id,
        quantity: quantities[id] || 1,
      }));

      await borrowRequestService.create({
        items: borrowItems,
        borrow_date: format(borrowDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
      });
      await fetchUser();
      toast.success(t("common.borrowRequestSubmitted"));
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("common.failedToBorrow"));
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
            {t("borrowRequestDesc")} ({uniqueBookIds.length} {t("books")})
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {hasPendingRequest && (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-700">
                {t("pendingBorrowRequestTitle")}
              </p>
              <p className="text-xs text-amber-600/90 leading-relaxed">
                {t("pendingBorrowRequestDesc")}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-5 p-6 pt-0 mt-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-foreground">
                  {tCommon("booksSelected")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("borrowRequestDetailsDesc") ||
                    tCommon("selectCopiesFromCollectionDesc")}
                </p>
              </div>

              <div className="inline-flex min-w-10 items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {uniqueBookIds.length}
              </div>
            </div>

            {loadingBooks && selectedBooks.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <DataLoading variant="card" size="sm" />
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
                              : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
                          )}
                        >
                          {(book.available_copies ?? 0) > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                              {t("stockAvailable", {
                                count: book.available_copies ?? 0,
                              })}
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

                    <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                        <Star className="h-3 w-3 fill-current" />
                        {book.average_rating
                          ? Number(book.average_rating).toFixed(1)
                          : "0.0"}
                      </div>

                      <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              book.id,
                              -1,
                              book.available_copies ?? 0,
                            )
                          }
                          disabled={quantities[book.id] <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:opacity-30"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-foreground">
                          {quantities[book.id] || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              book.id,
                              1,
                              book.available_copies ?? 0,
                            )
                          }
                          disabled={
                            quantities[book.id] >= (book.available_copies ?? 0)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                {tCommon("noBooksSelected")}
              </div>
            )}
          </div>

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
              <Label>{t("returnDateLabel")}</Label>
              <div className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-normal text-muted-foreground cursor-not-allowed">
                <Calendar className="h-4 w-4 shrink-0 opacity-50" />
                {returnDate
                  ? format(returnDate, "PPP")
                  : t("selectBorrowDateFirst")}
              </div>
              <p className="text-[10px] text-primary/80 font-medium px-1">
                {t("autoReturnDateInfo")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
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
                : selectedBooks.length > 0 &&
                    selectedBooks.some(
                      (book) => (book.available_copies ?? 0) === 0,
                    )
                  ? t("outOfStock")
                  : t("submitRequest")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
