"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";

export default function CategoryFormDialog({
  open,
  setOpen,
  category,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [category]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (category) {
        await categoryService.update(category.id, {
          name,
          description,
        });
        toast.success("Kategori berhasil diperbarui");
      } else {
        await categoryService.create({
          name,
          description,
        });
        toast.success("Kategori berhasil ditambahkan");
      }

      setOpen(false);
      onSuccess();
      setIsLoading(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Nama kategori"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            placeholder="Deskripsi (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading
              ? category
                ? "Menyimpan..."
                : "Menambahkan..."
              : category
                ? "Simpan"
                : "Tambah"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
