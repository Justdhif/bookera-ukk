"use client";

import { useState } from "react";
import { Save } from "@/types/save";
import { saveService } from "@/services/save.service";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  save: Save;
  onSuccess: () => void;
}

export default function EditSaveDialog({
  open,
  onOpenChange,
  save,
  onSuccess,
}: EditSaveDialogProps) {
  const t = useTranslations('collections.detail.editDialog');
  const [formData, setFormData] = useState({
    name: save.name,
    description: save.description || "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    setIsUpdating(true);
    try {
      await saveService.update(save.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      toast.success(t('updateSuccess'));
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" variant="required">{t('name')}</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t('namePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t('description')}</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t('descriptionPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="submit"
            onClick={handleUpdate}
            disabled={isUpdating || !formData.name.trim()}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdating ? t('updating') : t('update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
