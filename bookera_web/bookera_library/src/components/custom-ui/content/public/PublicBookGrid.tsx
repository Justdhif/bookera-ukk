"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Heart } from "lucide-react";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import { publicService } from "@/services/public.service";
import { favoriteService } from "@/services/favorite.service";
import BookCard from "./book-detail/BookCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";
import PublicBookFilters from "./PublicBookFilters";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";

interface PublicBookGridProps {
  fetchMode?: "books" | "favorites";
  search?: string;
  authorIds?: number[];
  publisherIds?: number[];
  genreIds?: number[];
  selectedBookIds?: number[];
  onSelectionChange?: (bookId: number, checked: boolean) => void;
  onVisibleBooksChange?: (books: Book[]) => void;
  onSelectAll?: (checked: boolean) => void;
  onBorrowRequest?: () => void;
  showBorrowActions?: boolean;
  refreshKey?: number;
}

import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function PublicBookGrid({
  fetchMode = "books",
  search,
  authorIds,
  publisherIds,
  genreIds,
  selectedBookIds = [],
  onSelectionChange,
  onVisibleBooksChange,
  onSelectAll,
  onBorrowRequest,
  showBorrowActions = true,
  refreshKey = 0,
}: PublicBookGridProps) {
  const tPublic = useTranslations("public");
  const tFavorites = useTranslations("public.favorites");
  const requestIdRef = useRef(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedRatingRange, setSelectedRatingRange] = useState<string | null>(
    null,
  );
  const [selectedMinReviews, setSelectedMinReviews] = useState<number | null>(
    null,
  );

  const effectiveSearch = search;

  const resetBookPagination = () => {
    setBooks([]);
    setPage(1);
    setTotalPages(1);
    setLoading(true);
    setLoadingMore(false);
  };

  useEffect(() => {
    resetBookPagination();
  }, [effectiveSearch]);

  useEffect(() => {
    onVisibleBooksChange?.(books);
  }, [books]);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const res = await publicService.getCategories({ per_page: 100 });

        if (active) {
          setCategories(res.data.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let active = true;
    const appendPage = page > 1;

    if (appendPage) {
      setLoading(false);
      setLoadingMore(true);
    } else {
      setLoading(true);
      setLoadingMore(false);
    }

    const fetchBooks = async () => {
      try {
        let nextBooks: Book[] = [];
        let fetchedLastPage = 1;

        if (fetchMode === "favorites") {
          const res = await favoriteService.getAll({
            per_page: ITEMS_PER_PAGE_OPTIONS[2],
            page,
            search: effectiveSearch || undefined,
            category_id: selectedCategoryId || undefined,
            rating:
              selectedRatingRange !== null
                ? Number(selectedRatingRange)
                : undefined,
            min_reviews:
              selectedMinReviews !== null ? selectedMinReviews : undefined,
          });

          if (!active || requestIdRef.current !== requestId) return;

          nextBooks = res.data.data.data
            .map((fav) => fav.book!)
            .filter(Boolean);
          fetchedLastPage = res.data.data.last_page;
        } else {
          const res = await publicService.getBooks({
            status: "active",
            per_page: ITEMS_PER_PAGE_OPTIONS[2],
            page,
            search: effectiveSearch || undefined,
            category_ids: selectedCategoryId ? [selectedCategoryId] : undefined,
            author_ids: authorIds,
            publisher_ids: publisherIds,
            genre_ids: genreIds,
            rating:
              selectedRatingRange !== null
                ? Number(selectedRatingRange)
                : undefined,
            min_reviews:
              selectedMinReviews !== null ? selectedMinReviews : undefined,
          });

          if (!active || requestIdRef.current !== requestId) return;

          nextBooks = res.data.data.data;
          fetchedLastPage = res.data.data.last_page;
        }

        setBooks((prev) => (appendPage ? [...prev, ...nextBooks] : nextBooks));
        setTotalPages(fetchedLastPage);
      } catch (error) {
        if (active && requestIdRef.current === requestId) {
          console.error(error);
        }
      } finally {
        if (active && requestIdRef.current === requestId) {
          if (appendPage) {
            setLoadingMore(false);
          } else {
            setLoading(false);
          }
        }
      }
    };

    fetchBooks();

    return () => {
      active = false;
    };
  }, [
    page,
    effectiveSearch,
    selectedCategoryId,
    selectedRatingRange,
    selectedMinReviews,
    authorIds,
    publisherIds,
    genreIds,
    fetchMode,
    refreshKey,
  ]);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId((current) =>
      current === categoryId ? null : categoryId,
    );
    resetBookPagination();
  };

  const handleRatingSelect = (value: string) => {
    setSelectedRatingRange(value === "all" ? null : value);
    resetBookPagination();
  };

  const handleReviewSelect = (value: string) => {
    setSelectedMinReviews(value === "all" ? null : Number(value));
    resetBookPagination();
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    setPage((current) => current + 1);
  };

  const isLoadingInitial = loading && books.length === 0;

  return (
    <div>
      <div className="space-y-4">
        <PublicBookFilters
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          selectedRating={selectedRatingRange}
          onRatingSelect={handleRatingSelect}
          selectedMinReviews={selectedMinReviews}
          onReviewSelect={handleReviewSelect}
          selectedCount={selectedBookIds.length}
          visibleCount={books.length}
          onSelectAll={onSelectAll}
          onBorrowRequest={onBorrowRequest}
          showBorrowActions={showBorrowActions}
        />

        {isLoadingInitial ? (
          <DataLoading size="lg" />
        ) : books.length === 0 ? (
          <FadeUp>
            <div className="space-y-4">
              <EmptyState
                icon={fetchMode === "favorites" ? <Heart /> : <Search />}
                title={
                  fetchMode === "favorites"
                    ? effectiveSearch || selectedCategoryId
                      ? tFavorites("noResults")
                      : tFavorites("noFavorites")
                    : tPublic("notFound")
                }
                description={
                  fetchMode === "favorites"
                    ? effectiveSearch || selectedCategoryId
                      ? tFavorites("noResultsDesc")
                      : tFavorites("noFavoritesDesc")
                    : tPublic("notFoundDesc")
                }
                variant="compact"
              />

              {page < totalPages && (
                <div className="flex justify-center pt-2">
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    variant="outline"
                    type="button"
                  />
                </div>
              )}
            </div>
          </FadeUp>
        ) : (
          <div className="space-y-6">
            <StaggerContainer
              className={cn(
                "grid grid-cols-2 gap-3 transition-opacity duration-300 sm:grid-cols-3 md:grid-cols-4",
              )}
            >
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  showCheckbox={showBorrowActions}
                  isChecked={selectedBookIds.includes(book.id)}
                  onCheckedChange={(checked) =>
                    onSelectionChange?.(book.id, checked)
                  }
                />
              ))}
            </StaggerContainer>

            {page < totalPages && (
              <FadeUp>
                <div className="flex justify-center pt-4 pb-2">
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    variant="outline"
                    type="button"
                  />
                </div>
              </FadeUp>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
