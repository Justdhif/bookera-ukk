"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Category } from "@/types/category";
import {
  categoryService,
  CategoryFilterParams,
} from "@/services/category.service";
import CategoryTable from "./CategoryTable";
import CategoryFormDialog from "./CategoryFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { Plus, Search, Tag } from "lucide-react";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
export default function CategoryClient() {
  const t = useTranslations("category");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState<CategoryFilterParams>({
    per_page: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);
  const confirmDelete = async () => {
    if (!deleteId) {
      toast.error("An error occurred");
      return;
    }
    await categoryService.delete(deleteId);
    toast.success(t("deleteSuccess"));
    setDeleteId(null);
    fetchCategories(filters);
  };
  const fetchCategories = async (activeFilters: CategoryFilterParams) => {
    setLoading(true);
    try {
      const res = await categoryService.getAll(activeFilters);
      const paginatedData = res.data.data;
      setCategories(paginatedData.data ?? paginatedData);
      setPagination({
        current_page: paginatedData.current_page ?? 1,
        last_page: paginatedData.last_page ?? 1,
        total: paginatedData.total ?? 0,
        from: paginatedData.from ?? 0,
        to: paginatedData.to ?? 0,
      });
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories(filters);
  }, [filters]);
  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("title")}
        description={t("managementDesc")}
        isAdmin
        rightActions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            variant="submit"
            className="h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("addCategory")}
          </Button>
        }
      />
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchCategoriesPlaceholder")}
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
      </div>
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
          <CategoryTable
            data={categories}
            onEdit={(cat) => {
              setEditing(cat);
              setOpen(true);
            }}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </PaginatedContent>
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deleteCategory")}
        description={t("deleteDesc")}
        onConfirm={confirmDelete}
      />
      <CategoryFormDialog
        open={open}
        setOpen={setOpen}
        category={editing}
        onSuccess={() => fetchCategories(filters)}
      />
    </div>
  );
}
