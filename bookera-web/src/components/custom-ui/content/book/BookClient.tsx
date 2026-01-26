"use client";

import { useEffect, useState } from "react";
import { bookService } from "@/services/book.service";
import { Book } from "@/types/book";
import { BookFormDialog } from "./BookFormDialog";
import { BookTable } from "./BookTable";
import { BookFilter } from "./BookFilter";
import { Button } from "@/components/ui/button";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { toast } from "sonner";
import { Category } from "@/types/category";
import { categoryService } from "@/services/category.service";

export default function BookClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState<{
    search?: string;
    category_id?: number;
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

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await bookService.getAll({
        ...filters,
        per_page: 10,
      });

      setBooks(res.data.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Manajemen Buku</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
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
      <BookTable
        data={books}
        loading={loading}
        onEdit={(book) => {
          setEditing(book);
          setOpen(true);
        }}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* FORM */}
      <BookFormDialog
        open={open}
        setOpen={setOpen}
        book={editing}
        onSuccess={fetchBooks}
      />

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
