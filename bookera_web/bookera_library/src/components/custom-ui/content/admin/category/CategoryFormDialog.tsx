"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
interface FormData {
  name: string;
  description: string;
}
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
  const t = useTranslations("category");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setFormData({
      name: category?.name ?? "",
      description: category?.description ?? "",
    });
  }, [category, open]);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const isFormValid = (): boolean => {
    const requiredFieldsFilled = formData.name.trim() !== "";
    if (!requiredFieldsFilled) return false;
    const hasValidationErrors = Object.values(errors).some(
      (error) => error === true,
    );
    if (hasValidationErrors) return false;
    return true;
  };
  const isSubmitDisabled = (): boolean => {
    return isLoading || !isFormValid();
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (category) {
        await categoryService.update(category.id, {
          name: formData.name,
          description: formData.description,
        });
        toast.success(t("updateSuccess"));
      } else {
        await categoryService.create({
          name: formData.name,
          description: formData.description,
        });
        toast.success(t("addSuccess"));
      }
      setFormData({
        name: "",
        description: "",
      });
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? t("editCategory") : t("addCategory")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" variant="required">
                {t("categoryName")}
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={t("namePlaceholder")}
                value={formData.name}
                onChange={handleInputChange}
                validationType="letters-only"
                onValidationChange={(isValid: boolean) =>
                  setErrors((prev) => ({ ...prev, name: !isValid }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("descriptionLabel")}</Label>
              <Input
                id="description"
                name="description"
                placeholder={t("descriptionPlaceholder")}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isSubmitDisabled()}
            loading={isLoading}
            className="w-full"
          >
            {isLoading
              ? category
                ? t("saving")
                : t("adding")
              : category
                ? t("saveChanges")
                : t("addCategory")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
