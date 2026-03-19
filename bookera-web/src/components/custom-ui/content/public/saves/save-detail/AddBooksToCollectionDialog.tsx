"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { bookService } from "@/services/book.service";
import { categoryService } from "@/services/category.service";
import { saveService } from "@/services/save.service";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookMarked, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/custom-ui/EmptyState";

interface Category {
  id: number;
  name: string;
}

interface AddBooksToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saveId: number;
  onSuccess: () => void;
}

export default function AddBooksToCollectionDialog({
  open,
  onOpenChange,
  saveId,
  onSuccess,
}: AddBooksToCollectionDialogProps) {
  const t = useTranslations("public");
  const [search, setSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories once when dialog opens
  useEffect(() => {
    if (!open) return;
    setCategoriesLoading(true);
    categoryService
      .getAll({ per_page: 100 })
      .then((res) => setCategories(res.data.data.data || []))
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, [open]);

  // Fetch books with debounce whenever search/filters change
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchBooks, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, selectedCategoryIds, open]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await bookService.getAll({
        search: search || undefined,
        category_ids:
          selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        per_page: 24,
      });
      setBooks(res.data.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) =>
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const toggleBook = (id: number) =>
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );

  const handleConfirm = async () => {
    if (selectedBookIds.length === 0) return;
    setAdding(true);
    try {
      await Promise.all(
        selectedBookIds.map((bookId) => saveService.addBook(saveId, bookId)),
      );
      toast.success(
        `${selectedBookIds.length} ${selectedBookIds.length === 1 ? t("book") : t("books")} ${t("addedToCollection")}`,
      );
      setSelectedBookIds([]);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("failedToAddBooks"),
      );
    } finally {
      setAdding(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setSearch("");
      setSelectedCategoryIds([]);
      setSelectedBookIds([]);
    }
    onOpenChange(val);
  };

  const confirmLabel =
    selectedBookIds.length === 0
      ? t("selectBooksToAdd")
      : `${t("addBooksPrefix")} ${selectedBookIds.length} ${selectedBookIds.length === 1 ? t("book") : t("books")}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {t("addBooksTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {!categoriesLoading && categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={
                  selectedCategoryIds.length === 0 ? "default" : "outline"
                }
                className="cursor-pointer transition-colors"
                onClick={() => setSelectedCategoryIds([])}
              >
                {t("allCategories")}
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={
                    selectedCategoryIds.includes(cat.id) ? "default" : "outline"
                  }
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : books.length === 0 ? (
              <EmptyState
                variant="compact"
                icon={<BookMarked />}
                title={t("noBooksFound")}
                description={t("tryDifferentSearch")}
                className="py-16"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {books.map((book) => {
                  const isSelected = selectedBookIds.includes(book.id);
                  return (
                    <div
                      key={book.id}
                      onClick={() => toggleBook(book.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-accent/40",
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleBook(book.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-muted">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookMarked className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-snug line-clamp-2">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {book.author}
                        </p>
                        <Badge
                          variant={
                            book.available_copies && book.available_copies > 0
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            "mt-1.5 text-xs",
                            book.available_copies && book.available_copies > 0
                              ? "bg-brand-primary hover:bg-brand-primary-dark text-white"
                              : "",
                          )}
                        >
                          {book.available_copies || 0}/
                          {book.total_copies || 0} {t("available")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t shrink-0 sm:justify-between gap-3">
          {selectedBookIds.length > 0 && (
            <p className="text-sm text-muted-foreground hidden sm:block self-center">
              {selectedBookIds.length}{" "}
              {selectedBookIds.length === 1 ? t("book") : t("books")}{" "}
              {t("selected")}
            </p>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="submit"
              onClick={() => handleOpenChange(false)}
              disabled={adding}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="submit"
              onClick={handleConfirm}
              disabled={selectedBookIds.length === 0 || adding}
            >
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("adding")}
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
