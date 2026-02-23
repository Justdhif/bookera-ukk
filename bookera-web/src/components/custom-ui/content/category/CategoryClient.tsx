"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import { categoryService } from "@/services/category.service";
import CategoryTable from "./CategoryTable";
import CategoryFormDialog from "./CategoryFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import { CategoryTableSkeleton } from "./CategoryTableSkeleton";
import { Plus, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CategoryClient() {
  const t = useTranslations('admin.common');
  const tAdmin = useTranslations('admin.categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) {
      toast.error(t('errorOccured'));
      return;
    };

    await categoryService.delete(deleteId);
    toast.success(t('categoryDeleted'));
    setDeleteId(null);
    fetchCategories();
  };

  const fetchCategories = async () => {
    setLoading(true);
    const res = await categoryService.getAll();
    setCategories(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
        <div className="p-2 bg-brand-primary rounded-lg">
          <Tag className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{tAdmin("title")}</h1>
          <p className="text-muted-foreground">{tAdmin("description")}</p>
        </div>
      </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          variant="brand"
          className="h-8 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('addCategory')}
        </Button>
      </div>

      {loading ? (
        <CategoryTableSkeleton />
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

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t('deleteCategory')}
        description={t('deleteCategoryWarning')}
        onConfirm={confirmDelete}
      />

      <CategoryFormDialog
        open={open}
        setOpen={setOpen}
        category={editing}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
