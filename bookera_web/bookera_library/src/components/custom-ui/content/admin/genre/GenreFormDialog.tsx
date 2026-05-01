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
import { Genre } from "@/types/genre";
import { genreService } from "@/services/genre.service";
import { toast } from "sonner";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface FormData {
  name: string;
  description: string;
}

export default function GenreFormDialog({
  open,
  setOpen,
  genre,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  genre: Genre | null;
  onSuccess: () => void;
}) {
  const t = useTranslations("genre");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData({
      name: genre?.name ?? "",
      description: genre?.description ?? "",
    });
  }, [genre, open]);

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
      if (genre) {
        await genreService.update(genre.id, {
          name: formData.name,
          description: formData.description,
        });
        toast.success(t("updateSuccess"));
      } else {
        await genreService.create({
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
      toast.error(err.response?.data?.message || t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {genre ? t("editGenre") : t("addGenre")}
          </DialogTitle>
        </DialogHeader>
        <StaggerContainer className="space-y-6">
          <div className="space-y-4">
            <FadeUp delay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="name" variant="required">
                  {t("genreName")}
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
            </FadeUp>
            <FadeUp delay={0.2}>
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
              {isLoading
                ? genre
                  ? t("saving")
                  : t("adding")
                : genre
                  ? t("saveChanges")
                  : t("addGenre")}
            </Button>
          </FadeUp>
        </StaggerContainer>
      </DialogContent>
    </Dialog>
  );
}