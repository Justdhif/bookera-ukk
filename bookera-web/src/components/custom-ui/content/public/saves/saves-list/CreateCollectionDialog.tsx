import { useTranslations } from "next-intl";
import { Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: { name: string; description: string };
  setFormData: (v: { name: string; description: string }) => void;
  isCreating: boolean;
  onSubmit: () => void;
}

/** Dialog untuk membuat koleksi baru */
export default function CreateCollectionDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  isCreating,
  onSubmit,
}: CreateCollectionDialogProps) {
    const t = useTranslations("public");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNew")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-name" variant="required">
              
                                        {t("detail.editDialog.name")}
                                      </Label>
            <Input
              id="save-name"
              placeholder={t("namePlaceholder")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="save-description">{t("detail.editDialog.description")}</Label>
            <Textarea
              id="save-description"
              placeholder={t("descriptionPlaceholder")}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
                      {t("detail.editDialog.cancel")}
                  </Button>
          <Button
            variant="submit"
            onClick={onSubmit}
            disabled={isCreating || !formData.name.trim()}
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreating ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
