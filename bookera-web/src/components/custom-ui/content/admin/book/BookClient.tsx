"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { useEffect, useState } from "react";
import { bookService, BookFilterParams } from "@/services/book.service";
import { Book } from "@/types/book";
import { BookTable } from "./BookTable";
import { BookFilter } from "./BookFilter";
import { Button } from "@/components/ui/button";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { toast } from "sonner";
import { Category } from "@/types/category";
import { categoryService } from "@/services/category.service";
import { BookOpen, Plus } from "lucide-react";
import { BookTableSkeleton } from "./BookTableSkeleton";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";

export default function BookClient() {
    const t = useTranslations("book");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const [filters, setFilters] = useState<BookFilterParams>({ per_page: 10 });

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data.data || []);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBooks = async (activeFilters: BookFilterParams) => {
    setLoading(true);
    try {
      const res = await bookService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setBooks(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch (error) {
      toast.error(t("loadError"));
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks(filters);
  }, [filters]);

  const confirmDelete = async () => {
    if (!deleteId) {
      toast.error("An error occurred");
      return;
    }

    await bookService.delete(deleteId);
    toast.success(t("deleteSuccess"));
    setDeleteId(null);
    fetchBooks(filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">Manage your book collection</p>
          </div>
        </div>
        <Link href="/admin/books/add">
          <Button variant="brand" className="h-8 gap-1">
            <Plus className="w-3.5 h-3.5" />
            
                                  {t("addBook")}
                                </Button>
        </Link>
      </div>

      <BookFilter
        categories={categories}
        onChange={(partial) =>
          setFilters((prev) => ({
            ...prev,
            ...partial,
            page: 1,
            status:
              partial.status !== undefined
                ? (partial.status as BookFilterParams["status"])
                : "status" in partial
                  ? undefined
                  : prev.status,
          }))
        }
        isLoading={loading}
      />

      <PaginatedContent
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      >
        {loading ? (
          <BookTableSkeleton />
        ) : (
          <BookTable data={books} onDelete={(id) => setDeleteId(id)} />
        )}
      </PaginatedContent>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deleteBook")}
        description="Are you sure you want to delete this book?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
