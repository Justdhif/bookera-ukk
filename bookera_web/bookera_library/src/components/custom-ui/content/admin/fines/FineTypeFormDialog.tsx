"use client";

import { useTranslations } from "next-intl";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { fineTypeService } from "@/services/fine-type.service";
import { toast } from "sonner";

export default function FineTypeFormDialog({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("fines");
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const [type, setType] = useState<"lost" | "damaged" | "late">("lost");
  const [inputMode, setInputMode] = useState<"amount" | "percentage">("amount");
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState("0");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setType("lost");
      setInputMode("amount");
      setAmount("");
      setPercentage("0");
      setDescription("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name) {
      toast.error(tCommon("pleaseCompleteRequiredFields") || "Name is required");
      return;
    }

    if (inputMode === "amount" && !amount) {
      toast.error(t("nameAndAmountRequired"));
      return;
    }

    if (inputMode === "percentage" && !percentage) {
      toast.error(t("nameAndPercentageRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        type,
        amount: inputMode === "amount" ? Number(amount) : 0,
        percentage: inputMode === "percentage" ? Number(percentage) : undefined,
        description: description || undefined,
      };
      await fineTypeService.create(payload);
      toast.success(t("fineTypeAddSuccess"));
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
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {t("addFineType")}
          </DialogTitle>
        </DialogHeader>
        <StaggerContainer className="space-y-6">
          <div className="space-y-4 pt-4">
            <FadeUp delay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="name" variant="required">
                  {t("fineTypeName")}
                </Label>
                <Input
                  id="name"
                  placeholder={t("fineNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="space-y-2">
                <Label htmlFor="type" variant="required">
                  {t("fineType")}
                </Label>
                <Select
                  value={type}
                  onValueChange={(v: any) => setType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">{t("lost")}</SelectItem>
                    <SelectItem value="damaged">{t("damaged")}</SelectItem>
                    <SelectItem value="late">{t("late")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="space-y-3">
                <Label variant="required">{t("fineValueLabel") || "Fine Value Type"}</Label>
                <RadioGroup 
                  value={inputMode} 
                  onValueChange={(v: any) => setInputMode(v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amount" id="mode-amount" />
                    <Label htmlFor="mode-amount" className="font-normal cursor-pointer">
                      {t("amountLabel") || "Fixed Amount"}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="mode-percentage" />
                    <Label htmlFor="mode-percentage" className="font-normal cursor-pointer">
                      {t("percentageLabel") || "Percentage"}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              {inputMode === "amount" ? (
                <div className="space-y-2">
                  <Label htmlFor="amount" variant="required">
                    {t("amountLabel")}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                      Rp
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={t("fineAmountPlaceholder")}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={0}
                      className="pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <Label htmlFor="percentage" variant="required">
                    {t("percentageLabel")}
                  </Label>
                  <div className="pt-2 pb-4">
                    <Slider
                      value={[Number(percentage)]}
                      onValueChange={(vals) => setPercentage(vals[0].toString())}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-24">
                      <Input
                        id="percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="pr-8 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                        %
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium italic">
                      {t("percentagePlaceholder") || "Adjust fine percentage"}
                    </span>
                  </div>
                </div>
              )}
            </FadeUp>

            <FadeUp delay={0.5}>
              <div className="space-y-2">
                <Label htmlFor="description">{t("fineDescription")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("fineDescPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.6}>
            <Button
              onClick={handleSubmit}
              variant="submit"
              disabled={isLoading || !name || (inputMode === "amount" ? !amount : !percentage)}
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? t("addingFineType") : t("addFineTypeBtn")}
            </Button>
          </FadeUp>
        </StaggerContainer>
      </DialogContent>
    </Dialog>
  );
}
