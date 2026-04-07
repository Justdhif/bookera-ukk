"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Heart } from "lucide-react";
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
import { BookPlus } from "lucide-react";
import { toast } from "sonner";
import BorrowRequestDialog from "@/components/custom-ui/content/book/BorrowRequestDialog";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

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
    setBooks([]);
    setSelectedBookIds([]);
    setPage(1);
  }, [debouncedQuery, selectedCategoryId]);

  const itemsPerPage = 12;

  useEffect(() => {
    let cancelled = false;
    const fetchFavorites = async () => {
      const appendPage = page > 1;

      if (appendPage) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

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
          setBooks((prev) => (appendPage ? [...prev, ...favoriteBooks] : favoriteBooks));
          setTotalPages(res.data.data.last_page);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          if (appendPage) {
            setLoadingMore(false);
          } else {
            setLoading(false);
          }
        }
      }
    };
    fetchFavorites();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, selectedCategoryId, itemsPerPage]);

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
          </div>
        </div>
        {books.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-dashed border-border">
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
          </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  showCheckbox={true}
                  isChecked={selectedBookIds.includes(book.id)}
                  onCheckedChange={(checked) =>
                    handleSelectBook(book.id, checked)
                  }
                />
              ))}
            </div>

            {page < totalPages && (
              <div className="flex justify-center pt-8 pb-4">
                <LoadMoreButton
                  onClick={() => setPage((p) => p + 1)}
                  loading={loadingMore}
                  variant="outline"
                />
              </div>
            )}
          </div>
        )}
      </section>

      <BorrowRequestDialog
        bookIds={selectedBookIds}
        initialBooks={books.filter((book) => selectedBookIds.includes(book.id))}
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        onSuccess={() => {
          setShowBorrowModal(false);
          setSelectedBookIds([]);
        }}
      />
    </div>
  );
}
