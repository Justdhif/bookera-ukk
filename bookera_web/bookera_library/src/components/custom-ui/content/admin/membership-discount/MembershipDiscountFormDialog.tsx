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
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { membershipDiscountService } from "@/services/membership-discount.service";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface FormData {
  discount_key: string;
  name: string;
  discount_percentage: string;
  description: string;
}

export default function MembershipDiscountFormDialog({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("membershipDiscount");
  const tCommon = useTranslations("common");
  const [formData, setFormData] = useState<FormData>({
    discount_key: "",
    name: "",
    discount_percentage: "0",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        discount_key: "",
        name: "",
        discount_percentage: "0",
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
      formData.discount_key.trim() !== "" && 
      formData.name.trim() !== "" && 
      formData.discount_percentage.trim() !== "";
    
    if (!requiredFieldsFilled) return false;

    const percentage = Number(formData.discount_percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) return false;

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
      await membershipDiscountService.create({
        discount_key: formData.discount_key,
        name: formData.name,
        discount_percentage: Number(formData.discount_percentage),
        description: formData.description || undefined,
      });
      toast.success(t("successAdd"));
      setFormData({
        discount_key: "",
        name: "",
        discount_percentage: "0",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("add")}
          </DialogTitle>
        </DialogHeader>
        <StaggerContainer className="space-y-6">
          <div className="space-y-4">
            <FadeUp delay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="discount_key" variant="required">
                  {t("key")}
                </Label>
                <Input
                  id="discount_key"
                  name="discount_key"
                  placeholder="e.g., student_discount"
                  value={formData.discount_key}
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
              <div className="space-y-4">
                <Label htmlFor="discount_percentage" variant="required">
                  {t("percentage")}
                </Label>
                <div className="pt-2 pb-4">
                  <Slider
                    value={[Number(formData.discount_percentage)]}
                    onValueChange={(vals) =>
                      setFormData((prev) => ({
                        ...prev,
                        discount_percentage: vals[0].toString(),
                      }))
                    }
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-24">
                    <Input
                      id="discount_percentage"
                      name="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      className="pr-8 text-center font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                      %
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium italic">
                    {t("percentageLabel") || "Discount Value"}
                  </span>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
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

          <FadeUp delay={0.5}>
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
