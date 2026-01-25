"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import { categoryService } from "@/services/category.service";
import CategoryTable from "./CategoryTable";
import CategoryFormDialog from "./CategoryFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";

export default function CategoryClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;

    await categoryService.delete(deleteId);
    toast.success("Kategori berhasil dihapus");
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

  const handleDelete = async (id: number) => {
    await categoryService.delete(id);
    toast.success("Kategori berhasil dihapus");
    fetchCategories();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Kategori</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          variant="brand"
        >
          Tambah Kategori
        </Button>
      </div>

      <CategoryTable
        data={categories}
        loading={loading}
        onEdit={(cat) => {
          setEditing(cat);
          setOpen(true);
        }}
        onDelete={(id) => setDeleteId(id)}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Kategori"
        description="Kategori yang dihapus tidak dapat dikembalikan."
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
