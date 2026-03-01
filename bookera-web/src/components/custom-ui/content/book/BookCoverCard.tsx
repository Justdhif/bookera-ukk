"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Upload,
  X,
  CheckCircle,
  XCircle,
  FileWarning,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BookCoverCardProps {
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

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export default function BookCoverCard({
  coverPreview,
  isEditMode = true,
  formData,
  setFormData,
  onCoverImageChange,
  onSwitchChange,
  isCoverRequired = false,
  coverError = false,
  onCoverValidationChange,
}: BookCoverCardProps) {
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
      const errorMsg =
        "Invalid file type. Please upload JPG, JPEG, or PNG images only.";
      setLocalError(errorMsg);
      toast.error(errorMsg);
      if (onCoverValidationChange) onCoverValidationChange(false);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const errorMsg =
        "File size exceeds 5MB limit. Please choose a smaller image.";
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
  const errorMessage = localError || (coverError && "Cover image is required");

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
              Book Cover
              {isCoverRequired && isEditMode && (
                <Badge
                  variant="destructive"
                  className="text-xs font-normal px-2 py-0 h-5"
                >
                  Required
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              {isEditMode
                ? "Upload a cover image for your book"
                : "Current book cover"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
        <div className="flex flex-col gap-4 flex-1">
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
                {hasError ? (
                  <>
                    <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                      <FileWarning className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Upload failed
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400/80 max-w-50">
                        {errorMessage}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        "p-3 rounded-full",
                        isDragging
                          ? "bg-primary/10 dark:bg-primary/20"
                          : "bg-gray-100 dark:bg-gray-800",
                      )}
                    >
                      <BookOpen
                        className={cn(
                          "h-8 w-8",
                          isDragging
                            ? "text-primary"
                            : "text-gray-400 dark:text-gray-500",
                        )}
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isDragging ? "Drop your image here" : "No cover image"}
                      </p>
                      {isEditMode && (
                        <>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            JPG, JPEG, or PNG (max. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </>
                )}
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
                variant={hasError ? "destructive" : "outline"}
                onClick={() => document.getElementById("cover_image")?.click()}
                className={cn(
                  "w-full gap-2 transition-colors",
                  hasError &&
                    "bg-red-50 hover:bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800",
                )}
              >
                <Upload className="h-4 w-4" />
                {coverPreview ? "Change Cover" : "Browse Files"}
              </Button>
            </>
          )}
        </div>

        <div className="rounded-lg border p-4 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium dark:text-gray-300">
                Book Status
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.is_active
                  ? "Book is available and visible to users"
                  : "Book is hidden from users"}
              </p>
            </div>
            {isEditMode ? (
              <Switch
                checked={formData.is_active}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500"
              />
            ) : (
              <Badge
                variant={formData.is_active ? "default" : "secondary"}
                className={cn(
                  "gap-1.5 px-3 py-1",
                  formData.is_active &&
                    "bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                )}
              >
                {formData.is_active ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Inactive
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
