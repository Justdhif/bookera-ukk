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
import { useTranslations } from "next-intl";

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
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin.common');
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
    if (!name.trim()) {
      toast.error(tAdmin('fieldRequired'));
      return;
    }

    setIsLoading(true);
    try {
      if (category) {
        await categoryService.update(category.id, {
          name,
          icon: icon || undefined,
          description,
        });
        toast.success(t('categoryUpdated'));
      } else {
        await categoryService.create({
          name,
          icon: icon || undefined,
          description,
        });
        toast.success(t('categoryAdded'));
      }

      // Reset form inputs setelah berhasil
      setName("");
      setIcon("");
      setDescription("");
      setOpen(false);
      onSuccess();
      setIsLoading(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('errorOccurred'));
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? tAdmin('edit') : tAdmin('add')} Kategori
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" variant="required">
                {t('categoryName')}
              </Label>
              <Input
                id="name"
                placeholder={t('categoryName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('bookDescription')}</Label>
              <Input
                id="description"
                placeholder={t('categoryDesc')}
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
            disabled={isLoading || !name.trim()}
            loading={isLoading}
            className="w-full"
          >
            {isLoading
              ? category
                ? tAdmin('saving')
                : t('addingCategory')
              : category
                ? tAdmin('save')
                : t('addCategory')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
