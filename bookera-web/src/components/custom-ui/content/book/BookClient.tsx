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
import { Plus } from "lucide-react";
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
      toast.error("Gagal memuat kategori");
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare params with proper serialization for array
      const params: any = {
        per_page: 10,
      };

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.category_ids && filters.category_ids.length > 0) {
        // Send as comma-separated string for Laravel
        params.category_ids = filters.category_ids.join(',');
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
      toast.error("Gagal memuat data buku");
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce effect for filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [fetchBooks]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Buku</h1>
          <p className="text-muted-foreground">
            Kelola buku di perpustakaan
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/books/add")}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Buku
        </Button>
      </div>

      {/* FILTER */}
      <BookFilter
        categories={categories}
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            ...value,
          }))
        }
      />

      {/* TABLE */}
      {loading ? (
        <BookTableSkeleton />
      ) : (
        <BookTable
          data={books}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* DELETE CONFIRM */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Hapus Buku"
        description="Apakah kamu yakin ingin menghapus buku ini?"
        onConfirm={async () => {
          await bookService.delete(deleteId!);
          toast.success("Buku berhasil dihapus");
          setDeleteId(null);
          fetchBooks();
        }}
      />
    </div>
  );
}
