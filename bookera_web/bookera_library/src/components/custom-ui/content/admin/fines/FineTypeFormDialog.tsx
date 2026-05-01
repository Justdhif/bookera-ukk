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
  const [name, setName] = useState("");
  const [type, setType] = useState<"lost" | "damaged" | "late">("lost");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDamaged = type === "damaged";
  const valueLabel = isDamaged ? t("percentageLabel") : t("amountLabel");
  const valuePlaceholder = isDamaged
    ? t("percentagePlaceholder")
    : t("fineAmountPlaceholder");

  useEffect(() => {
    if (!open) {
      setName("");
      setType("lost");
      setValue("");
      setDescription("");
    }
  }, [open]);
  const handleSubmit = async () => {
    if (!name || !value) {
      toast.error(
        isDamaged ? t("nameAndPercentageRequired") : t("nameAndAmountRequired"),
      );
      return;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      toast.error(
        isDamaged ? t("nameAndPercentageRequired") : t("nameAndAmountRequired"),
      );
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        type,
        amount: isDamaged ? 0 : numericValue,
        percentage: isDamaged ? numericValue : undefined,
        description: description || undefined,
      };
      await fineTypeService.create(payload);
      toast.success(t("fineTypeAddSuccess"));
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("addFineType")}
          </DialogTitle>
        </DialogHeader>
        <StaggerContainer className="space-y-6">
          <div className="space-y-4">
            <FadeUp delay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t("fineTypeName")} <span className="text-red-500">*</span>
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
                <Label htmlFor="type">
                  {t("fineType")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={(v: any) => {
                    setType(v);
                    setValue("");
                  }}
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
              <div className="space-y-2">
                <Label htmlFor="value">
                  {valueLabel} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder={valuePlaceholder}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  min={0}
                  max={isDamaged ? 100 : undefined}
                  step="0.01"
                />
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
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
          <FadeUp delay={0.5}>
            <Button
              onClick={handleSubmit}
              variant="submit"
              disabled={isLoading || !name || !value}
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
