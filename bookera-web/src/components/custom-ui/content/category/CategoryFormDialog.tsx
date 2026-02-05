"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Category } from "@/types/category";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";
import IconPicker from "@/components/custom-ui/IconPicker";

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
  const [icon, setIcon] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(category?.name ?? "");
    setIcon(category?.icon ?? "");
    setDescription(category?.description ?? "");
  }, [category, open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (category) {
        await categoryService.update(category.id, {
          name,
          icon: icon || undefined,
          description,
        });
        toast.success("Kategori berhasil diperbarui");
      } else {
        await categoryService.create({
          name,
          icon: icon || undefined,
          description,
        });
        toast.success("Kategori berhasil ditambahkan");
      }

      // Reset form inputs setelah berhasil
      setName("");
      setIcon("");
      setDescription("");
      setOpen(false);
      onSuccess();
      setIsLoading(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Nama kategori"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                placeholder="Deskripsi kategori (opsional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <IconPicker 
            value={icon} 
            onChange={setIcon}
            onClear={() => setIcon("")}
          />

          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isLoading || !name}
            loading={isLoading}
            className="w-full"
          >
            {isLoading
              ? category
                ? "Menyimpan..."
                : "Menambahkan..."
              : category
                ? "Simpan Perubahan"
                : "Tambah Kategori"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
