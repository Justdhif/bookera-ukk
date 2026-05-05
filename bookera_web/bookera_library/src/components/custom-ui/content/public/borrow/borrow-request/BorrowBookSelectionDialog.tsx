"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Star,
  BookOpen,
  Building2,
  Check,
  Plus,
  X,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { publicService } from "@/services/public.service";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import Image from "next/image";
import { cn } from "@/lib/utils";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";

interface BorrowBookSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBooks: (books: Book[]) => void;
  excludeBookIds: number[];
}

export function BorrowBookSelectionDialog({
  isOpen,
  onClose,
  onAddBooks,
  excludeBookIds,
}: BorrowBookSelectionDialogProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicService.getCategories({ per_page: 100 });
        setCategories(res.data.data.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchBooks = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const params = {
        page: isLoadMore ? page + 1 : 1,
        per_page: 10,
        search: debouncedSearch || undefined,
        category_ids: selectedCategoryId !== "all" ? [Number(selectedCategoryId)] : undefined,
        rating: selectedRating !== "all" ? Number(selectedRating) : undefined,
        status: "active" as const,
      };

      const res = await publicService.getBooks(params);
      let newBooks = res.data.data.data;
      
      if (excludeBookIds.length > 0) {
        newBooks = newBooks.filter(book => !excludeBookIds.includes(book.id));
      }
      
      if (isLoadMore) {
        setBooks((prev) => [...prev, ...newBooks]);
        setPage((prev) => prev + 1);
      } else {
        setBooks(newBooks);
        setPage(1);
      }
      setTotalPages(res.data.data.last_page);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBooks();
    }
  }, [isOpen, debouncedSearch, selectedCategoryId, selectedRating]);

  const handleToggleSelect = (bookId: number) => {
    setSelectedIds((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    fetchBooks(true);
  };

  const handleAdd = () => {
    const selectedBooks = books.filter((b) => selectedIds.includes(b.id));
    onAddBooks(selectedBooks);
    setSelectedIds([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl! w-full h-[90vh] flex flex-col p-0 border-2 shadow-2xl rounded-3xl">
        <DialogHeader className="px-8 py-7 border-b bg-muted/20">
          <StaggerContainer>
            <FadeUp>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                {t("addBookToRequest")}
              </DialogTitle>
            </FadeUp>
            <FadeUp>
              <DialogDescription className="mt-1">
                {t("addBookToRequestDesc")}
              </DialogDescription>
            </FadeUp>
          </StaggerContainer>
        </DialogHeader>

        <div className="px-8 space-y-4 pt-6">
          <StaggerContainer className="flex flex-col sm:flex-row items-center gap-4">
            <FadeUp className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={tCommon("searchBook")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11! rounded-xl border-2 shadow-sm transition-all duration-300 focus-visible:ring-primary/20 bg-background"
              />
            </FadeUp>
            
            <FadeUp className="flex flex-row items-center gap-3 w-full sm:w-auto">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="flex-1 sm:w-48 h-11! rounded-xl border-2 shadow-sm transition-all duration-300 bg-background">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="flex-1 sm:w-40 h-11! rounded-xl border-2 shadow-sm transition-all duration-300 bg-background">
                  <SelectValue placeholder={t("ratingFilter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{r}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FadeUp>
          </StaggerContainer>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col mt-6">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <DataLoading variant="inline" size="lg" />
            </div>
          ) : books.length === 0 ? (
            <div className="flex-1">
              <EmptyState
                icon={<BookOpen className="h-12 w-12 text-muted-foreground/50" />}
                title={tCommon("noBooksFound")}
                description={t("tryAdjustingFilters")}
              />
            </div>
          ) : (
            <ScrollArea className="flex-1 px-8">
              <StaggerContainer className="space-y-3 pb-6">
                {books.map((book) => {
                  const isSelected = selectedIds.includes(book.id);
                  const available = book.available_copies ?? 0;

                  return (
                    <FadeUp key={book.id}>
                      <div
                        onClick={() => available > 0 && handleToggleSelect(book.id)}
                        className={cn(
                          "group flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 border-2 border-transparent",
                          available === 0
                            ? "opacity-60 cursor-not-allowed bg-muted/10"
                            : "hover:bg-primary/5 hover:border-primary/20 cursor-pointer bg-card shadow-xs",
                          isSelected && "bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/10"
                        )}
                      >
                        <div className="relative">
                          <Checkbox
                            checked={isSelected}
                            disabled={available === 0}
                            className="h-5 w-5 rounded-md"
                          />
                        </div>

                        <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden border bg-muted shadow-sm">
                          <Image
                            src={book.cover_image ?? "/placeholder.png"}
                            alt={book.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {book.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {book.author}
                            </span>
                            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              {Number(book.average_rating).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2 py-0 border-none font-bold",
                              available > 0
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-rose-500/10 text-rose-500"
                            )}
                          >
                            {available > 0 ? `${available} ${t("available")}` : t("outOfStock")}
                          </Badge>
                        </div>
                      </div>
                    </FadeUp>
                  );
                })}
              </StaggerContainer>

              {page < totalPages && (
                <div className="py-6 flex justify-center">
                  <LoadMoreButton
                    variant="outline"
                    loading={loadingMore}
                    onClick={handleLoadMore}
                  />
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="px-8 py-6 border-t bg-muted/20 gap-4">
          <StaggerContainer className="flex w-full items-center justify-end gap-3">
            <FadeUp>
              <Button variant="outline" onClick={handleClose} className="rounded-xl px-8">
                {tCommon("cancel")}
              </Button>
            </FadeUp>
            <FadeUp>
              <Button
                onClick={handleAdd}
                variant="submit"
                disabled={selectedIds.length === 0}
                className="px-8"
              >
                {t("addSelected", { count: selectedIds.length })}
              </Button>
            </FadeUp>
          </StaggerContainer>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
