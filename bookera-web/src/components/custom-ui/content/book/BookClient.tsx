"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { bookService } from "@/services/book.service";
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

export default function BookClient() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState<{
    search?: string;
    category_ids?: number[];
    status?: "active" | "inactive";
    has_stock?: boolean;
  }>({});

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        per_page: 10,
      };

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.category_ids && filters.category_ids.length > 0) {
        params.category_ids = filters.category_ids.join(",");
      }

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.has_stock) {
        params.has_stock = filters.has_stock;
      }

      const res = await bookService.getAll(params);
      setBooks(res.data.data.data);
    } catch (error) {
      toast.error("Failed to load books");
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchBooks]);

  const confirmDelete = async () => {
    if (!deleteId) {
      toast.error("An error occurred");
      return;
    }

    await bookService.delete(deleteId);
    toast.success("Book deleted successfully");
    setDeleteId(null);
    fetchBooks();
  };

  const handleFilterChange = (
    value: Record<string, string | number[] | undefined>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-primary rounded-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Books</h1>
            <p className="text-muted-foreground">Manage your book collection</p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/admin/books/add")}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Book
        </Button>
      </div>

      <BookFilter
        categories={categories}
        onChange={handleFilterChange}
        isLoading={loading}
      />

      {loading ? (
        <BookTableSkeleton />
      ) : (
        <BookTable data={books} onDelete={(id) => setDeleteId(id)} />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Book"
        description="Are you sure you want to delete this book?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
