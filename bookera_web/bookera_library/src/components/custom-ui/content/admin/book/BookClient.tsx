"use client";

import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bookService } from "@/services/book.service";
import { Book, BookFilterParams } from "@/types/book";
import { BookTable } from "./BookTable";
import { BookFilter } from "./BookFilter";
import { Button } from "@/components/ui/button";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { toast } from "sonner";
import { Category } from "@/types/category";
import { categoryService } from "@/services/category.service";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import ImportBookDialog from "./ImportBookDialog";
import { BookOpen, Plus, FileSpreadsheet, Download } from "lucide-react";

export default function BookClient() {
  const t = useTranslations("book");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState<BookFilterParams>({ per_page: ITEMS_PER_PAGE_OPTIONS[1] });

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data.data || []);
    } catch (error) {
      toast.error(t("loadCategoriesError"));
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
      toast.error(t("genericError"));
      return;
    }
    await bookService.delete(deleteId);
    toast.success(t("deleteSuccess"));
    setDeleteId(null);
    fetchBooks(filters);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await bookService.export(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `books_export_${new Date().getTime()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t("exportSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("exportError"));
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("manageCollection")}
        isAdmin
        rightActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 gap-1 border-slate-200"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {t("importData")}
            </Button>
            <Button
              variant="outline"
              className="h-8 gap-1 border-slate-200"
              onClick={handleExport}
              disabled={loading}
            >
              <Download className="w-3.5 h-3.5" />
              {t("exportData")}
            </Button>
            <Link href="/admin/books/add">
              <Button variant="submit" className="h-8 gap-1">
                <Plus className="w-3.5 h-3.5" />
                {t("addBook")}
              </Button>
            </Link>
          </div>
        }
      />

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
          <DataLoading size="lg" />
        ) : (
          <BookTable data={books} onDelete={(id) => setDeleteId(id)} />
        )}
      </PaginatedContent>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deleteBook")}
        description={t("deleteBookDesc")}
        onConfirm={confirmDelete}
      />

      <ImportBookDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={() => fetchBooks(filters)}
      />
    </div>
  );
}
