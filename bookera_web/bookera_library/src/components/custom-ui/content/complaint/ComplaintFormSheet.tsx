"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { complaintService } from "@/services/complaint.service";
import { CreateComplaintData, ComplaintCategory } from "@/types/complaint";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES as ALLOWED_IMAGE_TYPES,
} from "@/constants/file";

const MAX_IMAGES = 5;

interface ComplaintFormSheetProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

interface ImagePreview {
  file: File;
  preview: string;
  hasError?: boolean;
  errorMessage?: string;
}

const defaultFormData: CreateComplaintData = {
  title: "",
  description: "",
  category: "other",
};

export default function ComplaintFormSheet({
  children,
  onSuccess,
}: ComplaintFormSheetProps) {
  const t = useTranslations("complaint.form");
  const tCategory = useTranslations("complaint.category");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagesPreviews, setImagesPreviews] = useState<ImagePreview[]>([]);
  const [formData, setFormData] = useState<CreateComplaintData>(defaultFormData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Cleanup object URLs on close
      imagesPreviews.forEach((img) => URL.revokeObjectURL(img.preview));
      setImagesPreviews([]);
      setFormData(defaultFormData);
    }
    setOpen(isOpen);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + imagesPreviews.filter(i => !i.hasError).length > MAX_IMAGES) {
      toast.error(t("imagesMaxError"));
      e.target.value = "";
      return;
    }

    const newPreviews: ImagePreview[] = files.map((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
          file,
          preview: "",
          hasError: true,
          errorMessage: t("imageFormatError"),
        };
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          file,
          preview: URL.createObjectURL(file),
          hasError: true,
          errorMessage: t("imageSizeError", { 
            size: (file.size / 1024 / 1024).toFixed(1) 
          }),
        };
      }
      return {
        file,
        preview: URL.createObjectURL(file),
        hasError: false,
      };
    });

    setImagesPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImagesPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: ComplaintCategory) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error(t("validationError"));
      return;
    }

    try {
      setSubmitting(true);

      const dataToSubmit: CreateComplaintData = {
        ...formData,
        images: imagesPreviews.filter(img => !img.hasError).map((img) => img.file),
      };

      await complaintService.create(dataToSubmit);
      toast.success(t("submitSuccess"));
      handleOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    imagesPreviews.every(img => !img.hasError);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-xl flex flex-col overflow-hidden p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <SheetTitle className="text-2xl font-bold">{t("sheetTitle")}</SheetTitle>
          <SheetDescription>{t("sheetDescription")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                {t("titleLabel")} <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder={t("titlePlaceholder")}
                value={formData.title}
                onChange={handleInputChange}
                disabled={submitting}
                className="rounded-xl border-2 h-11 focus-visible:ring-primary dark:bg-input/30"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">
                {t("categoryLabel")}
              </Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
                disabled={submitting}
              >
                <SelectTrigger
                  id="category"
                  className="w-full rounded-xl border-2 h-11 focus-visible:ring-primary dark:bg-input/30"
                >
                  <SelectValue placeholder={t("categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="website">{tCategory("website")}</SelectItem>
                  <SelectItem value="facility">{tCategory("facility")}</SelectItem>
                  <SelectItem value="service">{tCategory("service")}</SelectItem>
                  <SelectItem value="other">{tCategory("other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                {t("descriptionLabel")} <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t("descriptionPlaceholder")}
                value={formData.description}
                onChange={handleInputChange}
                disabled={submitting}
                rows={5}
                className="rounded-xl border-2 resize-none dark:bg-input/30"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{t("imagesLabel")}</Label>
                <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {t("imagesCount", { count: imagesPreviews.length })}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {imagesPreviews.map((img, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 group shadow-sm",
                      img.hasError
                        ? "border-destructive/50 bg-destructive/5 dark:bg-destructive/10"
                        : "border-border"
                    )}
                  >
                    {img.hasError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 gap-1">
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                        <p className="text-[9px] text-destructive font-medium text-center leading-tight">
                          {img.errorMessage}
                        </p>
                      </div>
                    ) : (
                      <Image
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className={cn(
                        "absolute top-1.5 right-1.5 p-1 rounded-full shadow-lg transition-all",
                        "bg-background/90 dark:bg-background/80 text-foreground border border-border/50",
                        "hover:bg-destructive hover:text-white hover:border-destructive",
                        img.hasError
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove image</span>
                    </button>
                  </div>
                ))}
                {imagesPreviews.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className={cn(
                      "aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 group",
                      "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
                      "text-muted-foreground hover:text-primary",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                      {t("addImageBtn")}
                    </span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />

              <div className="bg-muted/50 dark:bg-muted/30 p-3 rounded-xl flex gap-3 items-start border border-border/50">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t("imagesHint")}
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-border/60 bg-muted/30 dark:bg-muted/10 flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="flex-1 rounded-xl"
            >
              {t("cancelBtn")}
            </Button>
            <Button
              type="button"
              variant="submit"
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
              loading={submitting}
              className="flex-1 rounded-xl"
            >
              {submitting ? t("submittingBtn") : t("submitBtn")}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
