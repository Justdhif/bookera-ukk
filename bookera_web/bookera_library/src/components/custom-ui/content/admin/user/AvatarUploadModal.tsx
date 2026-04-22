"use client";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Check, FileWarning, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface AvatarUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  onSave: (avatarUrl: string | File) => void;
  userName: string;
  isRequired?: boolean;
}

import {
  MAX_AVATAR_SIZE as MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
} from "@/constants/file";

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/png?seed=1&backgroundColor=b6e3f4,c7d2fe,ddd6fe",
  "https://api.dicebear.com/7.x/bottts/png?seed=2&backgroundColor=fde68a,fcd34d,fbbf24",
  "https://api.dicebear.com/7.x/bottts/png?seed=3&backgroundColor=fbcfe8,f9a8d4,f472b6",
  "https://api.dicebear.com/7.x/bottts/png?seed=4&backgroundColor=a7f3d0,6ee7b7,34d399",
  "https://api.dicebear.com/7.x/bottts/png?seed=5&backgroundColor=fca5a5,f87171,ef4444",
];

export default function AvatarUploadModal({
  open,
  onOpenChange,
  currentAvatar = "",
  onSave,
  userName,
  isRequired = false,
}: AvatarUploadModalProps) {
  const t = useTranslations("setup-profile");
  const commonT = useTranslations("common");
  const [selectedAvatar, setSelectedAvatar] = useState<string | File>(
    currentAvatar,
  );
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedAvatar(currentAvatar);
      setPreviewUrl(currentAvatar);
      setLocalError(null);
    }
  }, [open, currentAvatar]);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const errorMsg = t("invalidFileType");
      setLocalError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = t("fileSizeExceed");
      setLocalError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultAvatarClick = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setPreviewUrl(avatarUrl);
    setLocalError(null);
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar("");
    setPreviewUrl("");
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (isRequired && !selectedAvatar) {
      const errorMsg = t("noAvatarSelected");
      setLocalError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    onSave(selectedAvatar);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar);
    setPreviewUrl(currentAvatar);
    setLocalError(null);
    onOpenChange(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasError = !!localError;
  const errorMessage =
    localError || (isRequired && !selectedAvatar && t("noAvatarSelected"));
  const isDisabled = !selectedAvatar || hasError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {commonT("uploadAvatar")}
            {isRequired && (
              <Badge
                variant="destructive"
                className="text-xs font-normal px-2 py-0 h-5"
              >
                {commonT("required")}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {t("chooseAvatarDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div
            className={cn(
              "relative flex flex-col items-center gap-4 p-6 rounded-xl transition-all duration-200",
              !previewUrl && "cursor-pointer border-2 border-dashed",
              isDragging && "border-primary bg-primary/5 dark:bg-primary/10",
              hasError
                ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 animate-shake"
                : "border-gray-300 dark:border-gray-700 hover:border-brand-primary/50",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!previewUrl) {
                fileInputRef.current?.click();
              }
            }}
          >
            {previewUrl ? (
              <>
                <div className="relative h-32 w-32">
                  <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800 transition-shadow duration-300">
                    <Image
                      src={previewUrl}
                      alt={userName}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-lg border-2 border-background hover:scale-110 transition-transform"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("removeAvatar")}</span>
                  </Button>
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("avatarPreview")}</p>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "p-4 rounded-full transition-colors duration-200",
                    isDragging
                      ? "bg-brand-primary/10 dark:bg-brand-primary/20"
                      : hasError
                        ? "bg-red-100 dark:bg-red-900/50"
                        : "bg-gray-100 dark:bg-gray-800",
                  )}
                >
                  {hasError ? (
                    <FileWarning className="h-10 w-10 text-red-600 dark:text-red-400" />
                  ) : (
                    <Upload
                      className={cn(
                        "h-10 w-10",
                        isDragging
                          ? "text-brand-primary"
                          : "text-gray-400 dark:text-gray-500",
                      )}
                    />
                  )}
                </div>
                <div className="text-center space-y-1">
                  {hasError ? (
                    <>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        {t("uploadFailed")}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400/80 max-w-50">
                        {errorMessage}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isDragging
                          ? t("dropImageHere")
                          : t("noAvatarSelected")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("dragDropHint")}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-brand-primary"></span>
              {t("defaultAvatars")}
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {DEFAULT_AVATARS.map((avatarUrl, idx) => {
                const isSelected = previewUrl === avatarUrl;
                return (
                  <Button
                    key={avatarUrl + idx}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDefaultAvatarClick(avatarUrl)}
                    className="relative h-16 w-16 p-0 rounded-full hover:bg-transparent group transition-all"
                  >
                    <div
                      className={cn(
                        "relative h-full w-full rounded-full transition-all duration-300",
                        isSelected
                          ? "ring-4 ring-brand-primary ring-offset-2 ring-offset-background scale-110"
                          : "ring-1 ring-gray-200 dark:ring-gray-800 group-hover:scale-105 group-hover:ring-brand-primary/50",
                      )}
                    >
                      <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-white dark:border-gray-900">
                        <Image
                          src={avatarUrl}
                          alt="Default avatar"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-brand-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 z-10 animate-in zoom-in duration-300">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-brand-primary"></span>
              {t("uploadYourOwn")}
            </h4>
            <div className="flex flex-col gap-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full gap-2 border-dashed h-12 hover:border-brand-primary hover:text-brand-primary transition-all",
                  hasError &&
                    "bg-red-50 hover:bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800",
                )}
              >
                <Upload className="h-4 w-4" />
                {previewUrl ? t("changePhoto") : t("browseFiles")}
              </Button>
              <p className="text-xs text-muted-foreground text-center italic">
                {t("formatHint")}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row gap-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleCancel} 
            className="flex-1 rounded-xl h-11"
          >
            {commonT("cancel")}
          </Button>
          <Button
            type="button"
            variant="submit"
            onClick={handleSave}
            disabled={isDisabled}
            className="flex-1 rounded-xl h-11 shadow-lg shadow-brand-primary/20"
          >
            {commonT("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

