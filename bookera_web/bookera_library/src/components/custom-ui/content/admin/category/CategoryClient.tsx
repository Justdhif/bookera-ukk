"use client";

import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/pagination";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Category, CategoryFilterParams } from "@/types/category";
import { categoryService } from "@/services/category.service";
import CategoryTable from "./CategoryTable";
import CategoryFormDialog from "./CategoryFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import { Plus, Search, Tag } from "lucide-react";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import DataLoading from "@/components/custom-ui/DataLoading";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";

export default function CategoryClient() {
  const t = useTranslations("category");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState<CategoryFilterParams>({
    per_page: ITEMS_PER_PAGE_OPTIONS[1],
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
      toast.error(t("errorOccurred"));
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
    <StaggerContainer className="space-y-6">
      <FadeUp>
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
      </FadeUp>
      <FadeUp delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchCategoriesPlaceholder")}
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
        </div>
      </FadeUp>
      <FadeUp delay={0.2}>
        <PaginatedContent
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        >
          {loading ? (
            <FadeIn key="loading">
              <DataLoading size="lg" />
            </FadeIn>
          ) : (
            <FadeIn key="content">
              <CategoryTable
                data={categories}
                onEdit={(cat) => {
                  setEditing(cat);
                  setOpen(true);
                }}
                onDelete={(id) => setDeleteId(id)}
              />
            </FadeIn>
          )}
        </PaginatedContent>
      </FadeUp>
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
    </StaggerContainer>
  );
}
