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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { discountKeyService } from "@/services/discount-key.service";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface FormData {
  key: string;
  name: string;
  description: string;
}

export default function DiscountKeyFormDialog({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("discountKey");
  const tCommon = useTranslations("common");
  const [formData, setFormData] = useState<FormData>({
    key: "",
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        key: "",
        name: "",
        description: "",
      });
      setErrors({});
    }
  }, [open]);

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
    const requiredFieldsFilled = 
      formData.key.trim() !== "" && 
      formData.name.trim() !== "";
    
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
      await discountKeyService.create({
        key: formData.key,
        name: formData.name,
        description: formData.description || undefined,
      });
      toast.success(t("successAdd"));
      setFormData({
        key: "",
        name: "",
        description: "",
      });
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || tCommon("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t("add")}
          </DialogTitle>
        </DialogHeader>
        <StaggerContainer className="space-y-6">
          <div className="space-y-4">
            <FadeUp delay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="key" variant="required">
                  {t("key")}
                </Label>
                <Input
                  id="key"
                  name="key"
                  placeholder="e.g., student_discount"
                  value={formData.key}
                  onChange={handleInputChange}
                />
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="space-y-2">
                <Label htmlFor="name" variant="required">
                  {t("name")}
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t("namePlaceholder") || t("name")}
                  value={formData.name}
                  onChange={handleInputChange}
                  validationType="letters-only"
                  onValidationChange={(isValid: boolean) =>
                    setErrors((prev) => ({ ...prev, name: !isValid }))
                  }
                />
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="space-y-2">
                <Label htmlFor="description">{tCommon("description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t("desc")}
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.4}>
            <Button
              onClick={handleSubmit}
              variant="submit"
              disabled={isSubmitDisabled()}
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? tCommon("adding") || "Adding..." : t("add")}
            </Button>
          </FadeUp>
        </StaggerContainer>
      </DialogContent>
    </Dialog>
  );
}
