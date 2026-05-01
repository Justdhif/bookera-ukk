"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Upload, X, FileWarning, Trash, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
} from "@/constants/file";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface BookSideCardProps {
  coverPreview: string;
  isEditMode?: boolean;
  formData: {
    is_active: boolean;
  };
  setFormData: (data: any) => void;
  onCoverImageChange: (file: File | null, preview: string) => void;
  onSwitchChange?: (checked: boolean) => void;
  isCoverRequired?: boolean;
  coverError?: boolean;
  onCoverValidationChange?: (isValid: boolean) => void;
}

export default function BookSideCard({
  coverPreview,
  isEditMode = true,
  formData,
  setFormData,
  onCoverImageChange,
  onSwitchChange,
  isCoverRequired = false,
  coverError = false,
  onCoverValidationChange,
}: BookSideCardProps) {
  const t = useTranslations("book");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSwitchChange = (checked: boolean) => {
    if (onSwitchChange) {
      onSwitchChange(checked);
    } else if (setFormData) {
      setFormData({ ...formData, is_active: checked });
    }
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const errorMsg = t("invalidFileType");
      setLocalError(errorMsg);
      toast.error(errorMsg);
      if (onCoverValidationChange) onCoverValidationChange(false);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = t("fileSizeExceed");
      setLocalError(errorMsg);
      toast.error(errorMsg);
      if (onCoverValidationChange) onCoverValidationChange(false);
      return false;
    }
    setLocalError(null);
    if (onCoverValidationChange) onCoverValidationChange(true);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onCoverImageChange(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveCover = () => {
    onCoverImageChange(null, "");
    setLocalError(null);
    if (onCoverValidationChange) {
      onCoverValidationChange(!isCoverRequired);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEditMode) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isEditMode) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (validateFile(file)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onCoverImageChange(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const hasError = localError || coverError;
  const errorMessage = localError || (coverError && t("coverRequired"));

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-primary" />
              {t("bookCover")}
            </CardTitle>
            <CardDescription>
              {isEditMode ? t("uploadCover") : t("bookDetailsComplete")}
            </CardDescription>
          </div>
          {isCoverRequired && isEditMode && (
            <Badge
              variant="destructive"
              className="text-xs font-normal px-2 py-0 h-5"
            >
              {t("required")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <StaggerContainer as={CardContent} className="space-y-4 pt-0">
        <FadeUp delay={0.1} className="space-y-2">
          <Label
            className={cn("text-sm font-medium", coverError && "text-red-500")}
          >
            {t("cover")}
          </Label>
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "relative w-full rounded-xl overflow-hidden transition-all duration-200",
                "aspect-3/4",
                isEditMode && !coverPreview && "cursor-pointer",
                isDragging &&
                  "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (isEditMode && !coverPreview) {
                  document.getElementById("cover_image")?.click();
                }
              }}
            >
              {coverPreview ? (
                <>
                  <div className="relative w-full h-full">
                    <Image
                      src={coverPreview}
                      alt="Book cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCover();
                      }}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove cover</span>
                    </Button>
                  )}
                </>
              ) : (
                <div
                  className={cn(
                    "w-full h-full border-2 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors duration-200 p-6",
                    hasError
                      ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
                      : isDragging
                        ? "border-primary bg-primary/5 dark:bg-primary/10 border-dashed"
                        : "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30",
                    !isEditMode && "cursor-default",
                  )}
                >
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div
                      className={cn(
                        "p-4 rounded-2xl transition-all duration-300 shadow-sm",
                        hasError
                          ? "bg-red-50 dark:bg-red-950/30 text-red-500"
                          : "bg-brand-primary/10 text-brand-primary group-hover:scale-110",
                      )}
                    >
                      {hasError ? (
                        <FileWarning className="h-8 w-8" />
                      ) : (
                        <Upload className="h-8 w-8" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          hasError
                            ? "text-red-600 dark:text-red-400"
                            : "text-foreground",
                        )}
                      >
                        {hasError ? errorMessage : t("dragDropUpload")}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t("formatHint")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isEditMode && (
              <>
                <Input
                  id="cover_image"
                  type="file"
                  accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("cover_image")?.click()}
                  className="w-full h-10 gap-2 font-medium border-2 hover:bg-brand-primary/5 hover:border-brand-primary transition-all duration-300"
                >
                  <Upload className="h-4 w-4" />
                  {coverPreview ? t("changeCover") : t("browseFiles")}
                </Button>
              </>
            )}
          </div>
        </FadeUp>

        <FadeUp delay={0.2} className="rounded-lg border p-4 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="text-sm font-semibold">
              {t("statusLabel")}
            </Label>
            {isEditMode ? (
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={handleSwitchChange}
              />
            ) : (
              <ActiveStatusBadge isActive={formData.is_active} />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {t("activeDesc")}
          </p>
        </FadeUp>
      </StaggerContainer>
    </Card>
  );
}
