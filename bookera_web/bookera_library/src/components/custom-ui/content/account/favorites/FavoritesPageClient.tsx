"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { favoriteService } from "@/services/favorite.service";
import { categoryService } from "@/services/category.service";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import BookCard from "@/components/custom-ui/content/book/BookCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BorrowRequestDialog from "@/components/custom-ui/content/book/BorrowRequestDialog";

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

function BooksGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="w-full aspect-3/4 rounded-xl" />
      ))}
    </div>
  );
}

export default function FavoritesPageClient() {
  const t = useTranslations("public.favorites");
  const tPublic = useTranslations("public");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [direction, setDirection] = useState(0);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const prevPageRef = useRef(page);

  useEffect(() => {
    categoryService
      .getAll({ per_page: 50 })
      .then((res) => {
        setCategories(res.data.data.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setDirection(page > prevPageRef.current ? 1 : -1);
    prevPageRef.current = page;
  }, [page]);

  useEffect(() => {
    setPage(1);
    prevPageRef.current = 1;
  }, [debouncedQuery, selectedCategoryId]);

  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await favoriteService.getAll({
          per_page: itemsPerPage,
          page: page,
          search: debouncedQuery || undefined,
          category_id: selectedCategoryId || undefined,
        });
        if (!cancelled) {
          const favoriteBooks = res.data.data.data
            .map((fav) => fav.book!)
            .filter(Boolean);
          setBooks(favoriteBooks);
          setTotalPages(res.data.data.last_page);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchFavorites();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, selectedCategoryId, itemsPerPage]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedBookIds([]);
  };

  const handleSelectBook = (bookId: number, checked: boolean) => {
    if (checked) {
      setSelectedBookIds((prev) => [...prev, bookId]);
    } else {
      setSelectedBookIds((prev) => prev.filter((id) => id !== bookId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookIds(books.map((b) => b.id));
    } else {
      setSelectedBookIds([]);
    }
  };

  return (
    <div className="container space-y-6">
      <div className="space-y-6">
        <ContentHeader
          title={t("title")}
          description={t("description")}
        />
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <Select
              value={selectedCategoryId ? String(selectedCategoryId) : "all"}
              onValueChange={(val) =>
                setSelectedCategoryId(val === "all" ? null : Number(val))
              }
            >
              <SelectTrigger className="w-full sm:w-48 h-10">
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={isSelectionMode ? "secondary" : "outline"}
              onClick={toggleSelectionMode}
              className="h-10 shrink-0"
            >
              {isSelectionMode ? tPublic("common.cancel") : tPublic("common.selectBook")}
            </Button>
          </div>
        </div>
        {isSelectionMode && books.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-dashed border-border"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id="select-all"
                checked={selectedBookIds.length === books.length && books.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer select-none"
              >
                {tPublic("common.selectAll") || "Select All"} ({selectedBookIds.length}/{books.length})
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="submit"
                size="sm"
                disabled={selectedBookIds.length === 0}
                onClick={() => setShowBorrowModal(true)}
                className="gap-2"
              >
                <BookPlus className="h-4 w-4" />
                {tPublic("detail.borrowSelected")}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      <section className="space-y-3">
        {loading ? (
          <BooksGridSkeleton />
        ) : books.length === 0 ? (
          <EmptyState
            icon={<Heart />}
            title={
              debouncedQuery || selectedCategoryId
                ? t("noResults")
                : t("noFavorites")
            }
            description={
              debouncedQuery || selectedCategoryId
                ? t("noResultsDesc")
                : t("noFavoritesDesc")
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="relative overflow-hidden min-h-[300px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {books.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        showCheckbox={isSelectionMode}
                        isChecked={selectedBookIds.includes(book.id)}
                        onCheckedChange={(checked) =>
                          handleSelectBook(book.id, checked)
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 pb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <BorrowRequestDialog
        bookIds={selectedBookIds}
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        onSuccess={() => {
          setShowBorrowModal(false);
          setIsSelectionMode(false);
          setSelectedBookIds([]);
        }}
      />
    </div>
  );
}
