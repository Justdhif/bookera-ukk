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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { toast } from "sonner";
import { borrowRequestService } from "@/services/borrow-request.service";
import ReCAPTCHA from "react-google-recaptcha";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import Image from "next/image";
import { BookOpen, Building2, Star } from "lucide-react";

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

  const {
    siteKey,
    recaptchaRef,
    token,
    handleRecaptchaChange,
    reset: resetRecaptcha,
  } = useRecaptcha();

  const handleClose = () => {
    onClose();
    setBorrowDate(undefined);
    setReturnDate(undefined);
    setSelectedBooks([]);
    resetRecaptcha();
  };

  const handleDialogOutsideInteraction = (event: {
    preventDefault: () => void;
  }) => {
    event.preventDefault();
  };

  const isSubmitDisabled =
    loading ||
    bookIds.length === 0 ||
    (loadingBooks && selectedBooks.length === 0) ||
    !borrowDate ||
    !returnDate ||
    returnDate <= borrowDate ||
    !token;

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

      const uniqueBookIds = Array.from(new Set(bookIds));
      const cachedBooks = uniqueBookIds
        .map((bookId) => initialBooks.find((book) => book.id === bookId))
        .filter((book): book is Book => Boolean(book));
      const missingBookIds = uniqueBookIds.filter(
        (bookId) => !cachedBooks.some((book) => book.id === bookId),
      );

      if (cachedBooks.length > 0) {
        setSelectedBooks(cachedBooks);
      }

      if (missingBookIds.length === 0) {
        setLoadingBooks(false);
        return;
      }

      setLoadingBooks(true);
      try {
        const responses = await Promise.all(
          missingBookIds.map((bookId) => bookService.getById(bookId)),
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

    if (!token) {
      toast.error(t("pleaseVerifyRecaptcha") || "Please verify reCAPTCHA");
      return;
    }

    try {
      setLoading(true);
      await borrowRequestService.create({
        book_ids: bookIds,
        borrow_date: format(borrowDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
        recaptcha_token: token,
      });
      toast.success(t("common.borrowRequestSubmitted") || "Borrow request created successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error: any) {
      resetRecaptcha();
      toast.error(
        error.response?.data?.message || t("common.failedToBorrow") || "Failed to create borrow request",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={false}>
      <DialogContent
        className="max-w-2xl! sm:max-w-2xl! lg:max-w-3xl! p-0 overflow-visible"
        onPointerDownOutside={handleDialogOutsideInteraction}
        onInteractOutside={handleDialogOutsideInteraction}
      >
        <div className="max-h-[90vh] overflow-y-auto scrollbar-hide p-6">
          <DialogHeader>
            <DialogTitle>{t("borrowRequestTitle")}</DialogTitle>
            <DialogDescription>
              {bookIds.length > 1
                ? `${t("borrowRequestDesc")} (${bookIds.length} ${t("books")})`
                : t("borrowRequestDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
          <section className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
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
                {selectedBooks.length || bookIds.length}
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

          <div>
            <div className="flex justify-center overflow-visible">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={handleRecaptchaChange}
                theme="light"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              {t("detail.editDialog.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitDisabled}
              loading={loading}
              variant="submit"
            >
              {loading ? t("processingBtn") : t("submitRequest")}
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
