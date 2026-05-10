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
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { membershipDiscountService } from "@/services/membership-discount.service";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscountKey } from "@/types/membership-discount";

interface FormData {
  discount_key_id: string;
  discount_percentage: string;
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
    discount_key_id: "",
    discount_percentage: "0",
  });
  const [discountKeys, setDiscountKeys] = useState<DiscountKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingKeys, setIsFetchingKeys] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      setIsFetchingKeys(true);
      try {
        const response = await membershipDiscountService.getDiscountKeys();
        const resData = response.data.data;
        // Handle both direct array and paginated response
        if (Array.isArray(resData)) {
          setDiscountKeys(resData);
        } else if (resData && typeof resData === 'object' && 'data' in resData) {
          setDiscountKeys(resData.data);
        }
      } catch (err) {
        console.error("Failed to fetch discount keys", err);
      } finally {
        setIsFetchingKeys(false);
      }
    };

    if (open) {
      setFormData({
        discount_key_id: "",
        discount_percentage: "0",
      });
      fetchKeys();
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
      formData.discount_key_id !== "" && 
      formData.discount_percentage.trim() !== "";
    
    if (!requiredFieldsFilled) return false;

    const percentage = Number(formData.discount_percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) return false;

    return true;
  };

  const isSubmitDisabled = (): boolean => {
    return isLoading || !isFormValid();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await membershipDiscountService.create({
        discount_key_id: Number(formData.discount_key_id),
        discount_percentage: Number(formData.discount_percentage),
      });
      toast.success(t("successAdd"));
      setFormData({
        discount_key_id: "",
        discount_percentage: "0",
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
                <Label htmlFor="discount_key_id" variant="required">
                  {t("key")}
                </Label>
                <Select
                  value={formData.discount_key_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, discount_key_id: value }))
                  }
                  disabled={isFetchingKeys}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isFetchingKeys ? "Loading..." : t("selectKey") || "Select Discount Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {discountKeys.map((key) => (
                      <SelectItem key={key.id} value={key.id.toString()}>
                        {key.name} ({key.key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.discount_key_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {discountKeys.find(k => k.id.toString() === formData.discount_key_id)?.description}
                  </p>
                )}
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
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
          </div>

          <FadeUp delay={0.3}>
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
