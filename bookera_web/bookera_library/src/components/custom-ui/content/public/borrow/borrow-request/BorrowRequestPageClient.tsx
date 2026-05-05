"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { borrowRequestService } from "@/services/borrow-request.service";
import { publicService } from "@/services/public.service";
import { Book } from "@/types/book";
import {
  BookOpen,
  AlertCircle,
  ShoppingCart,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { BorrowRequestBookCardList } from "./BorrowRequestBookCard";
import { BorrowBookSelectionDialog } from "./BorrowBookSelectionDialog";
import { BorrowRequestDateCard } from "./BorrowRequestDateCard";
import { BorrowRequestSummaryCard } from "./BorrowRequestSummaryCard";
import { useBorrowStore } from "@/store/borrow.store";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
import DiscardConfirmDialog from "@/components/custom-ui/modal/DiscardConfirmDialog";

export default function BorrowRequestPageClient() {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const { user, fetchUser, isAuthenticated, initialLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const { 
    selectedBookIds: bookIds, 
    setSelectedBookIds, 
    removeBookId, 
    clearSelectedBooks 
  } = useBorrowStore();

  const [borrowDate, setBorrowDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  const handleBack = () => {
    if (uniqueBookIds.length > 0) {
      setIsDiscardDialogOpen(true);
    } else {
      router.back();
    }
  };

  const hasPendingRequest = user?.has_pending_borrow_request ?? false;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bookIds.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [bookIds.length]);

  const uniqueBookIds = useMemo(
    () => Array.from(new Set(bookIds)),
    [bookIds]
  );

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

  const handleRemoveBook = useCallback(
    (bookId: number) => {
      removeBookId(bookId);
      setSelectedBooks((prev) => prev.filter((b) => b.id !== bookId));
      setQuantities((prev) => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
    },
    [removeBookId]
  );

  const handleAddSelectedBooks = (newBooks: Book[]) => {
    const newBookIds = newBooks.map((b) => b.id);
    setSelectedBookIds(Array.from(new Set([...bookIds, ...newBookIds])));
    
    setSelectedBooks((prev) => {
      const existingIds = prev.map((b) => b.id);
      const filteredNewBooks = newBooks.filter((nb) => !existingIds.includes(nb.id));
      return [...prev, ...filteredNewBooks];
    });
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
    if (initialLoading) return;

    if (uniqueBookIds.length === 0) {
      setLoadingBooks(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${pathname}`);
        return;
      }

      setCheckingUser(true);
      await fetchUser();
      if (cancelled) return;
      setCheckingUser(false);

      setLoadingBooks(true);
      try {
        const responses = await Promise.all(
          uniqueBookIds.map((bookId) => publicService.getBookById(bookId))
        );

        if (!cancelled) {
          const fetchedBooks = responses.map(
            (response: any) => response.data.data
          );
          setSelectedBooks(fetchedBooks.filter(Boolean));
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
  }, [uniqueBookIds.length, isAuthenticated, initialLoading, fetchUser]);

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

    if (uniqueBookIds.length === 0) {
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
      clearSelectedBooks();
      toast.success(t("common.borrowRequestSubmitted"));

      const userSlug = user?.slug;
      router.push(userSlug ? `/${userSlug}/my-borrows` : "/my-borrows");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("common.failedToBorrow"));
    } finally {
      setLoading(false);
    }
  };

  const totalSelectedBooks = uniqueBookIds.length;
  const totalQuantity = uniqueBookIds.reduce(
    (acc, id) => acc + (quantities[id] || 1),
    0
  );

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("borrowRequestTitle")}
          description={t("borrowRequestDesc")}
          showBackButton
          onBack={handleBack}
        />
      </FadeUp>

      {hasPendingRequest && (
        <FadeUp>
          <div className="flex items-start gap-4 rounded-2xl bg-amber-500/10 p-5 border-2 border-amber-500/20">
            <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-600 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {t("pendingBorrowRequestTitle")}
              </p>
              <p className="text-xs text-amber-600/90 dark:text-amber-400/70 leading-relaxed">
                {t("pendingBorrowRequestDesc")}
              </p>
            </div>
          </div>
        </FadeUp>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <BorrowRequestDateCard
            borrowDate={borrowDate}
            setBorrowDate={setBorrowDate}
            returnDate={returnDate}
          />

          <BorrowRequestBookCardList
            selectedBooks={selectedBooks}
            quantities={quantities}
            loadingBooks={loadingBooks}
            totalSelectedBooks={totalSelectedBooks}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveBook}
            onAddClick={() => setIsSelectionDialogOpen(true)}
          />
        </div>

        <div className="lg:col-span-1 lg:self-start lg:sticky lg:top-4 space-y-6">
          <BorrowRequestSummaryCard
            totalSelectedBooks={totalSelectedBooks}
            totalQuantity={totalQuantity}
            borrowDate={borrowDate}
            returnDate={returnDate}
            loading={loading}
            loadingBooks={loadingBooks}
            isSubmitDisabled={isSubmitDisabled}
            hasOutOfStockBook={selectedBooks.some((book) => (book.available_copies ?? 0) === 0)}
            onSubmit={handleSubmit}
            onCancel={handleBack}
          />
        </div>
      </div>

      <BorrowBookSelectionDialog
        isOpen={isSelectionDialogOpen}
        onClose={() => setIsSelectionDialogOpen(false)}
        onAddBooks={handleAddSelectedBooks}
        excludeBookIds={uniqueBookIds}
      />

      <DiscardConfirmDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
        onConfirm={() => {
          clearSelectedBooks();
          router.back();
        }}
      />
    </StaggerContainer>
  );
}
