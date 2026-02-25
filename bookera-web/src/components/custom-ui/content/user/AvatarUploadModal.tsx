"use client";

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
import { Upload, X, Check, FileWarning } from "lucide-react";
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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

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
      const errorMsg =
        "Invalid file type. Please upload JPG, JPEG, or PNG images only.";
      setLocalError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const errorMsg =
        "File size exceeds 2MB limit. Please choose a smaller image.";
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
      const errorMsg = "Avatar is required";
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
    localError || (isRequired && !selectedAvatar && "Avatar is required");

  const isDisabled = !selectedAvatar || hasError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Upload Avatar
            {isRequired && (
              <Badge
                variant="destructive"
                className="text-xs font-normal px-2 py-0 h-5"
              >
                Required
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Choose from default avatars or upload your own image
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
                : "border-gray-300 dark:border-gray-700",
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
                  <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800">
                    <Image
                      src={previewUrl}
                      alt="Avatar preview"
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized={true}
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
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove avatar</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Avatar Preview</p>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "p-4 rounded-full",
                    isDragging
                      ? "bg-primary/10 dark:bg-primary/20"
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
                          ? "text-primary"
                          : "text-gray-400 dark:text-gray-500",
                      )}
                    />
                  )}
                </div>
                <div className="text-center space-y-1">
                  {hasError ? (
                    <>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Upload failed
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400/80 max-w-50">
                        {errorMessage}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isDragging
                          ? "Drop your image here"
                          : "No avatar selected"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Drag and drop or click to upload
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Default Avatars</h4>
            <div className="grid grid-cols-5 gap-2">
              {DEFAULT_AVATARS.map((avatarUrl) => {
                const isSelected = previewUrl === avatarUrl;

                return (
                  <Button
                    key={avatarUrl}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDefaultAvatarClick(avatarUrl)}
                    className="relative h-auto w-auto p-0 hover:bg-transparent group"
                  >
                    <div
                      className={cn(
                        "relative rounded-full transition-all duration-200",
                        isSelected
                          ? "ring-2 ring-offset-2 ring-brand-primary ring-offset-background scale-105"
                          : "group-hover:scale-105 group-hover:ring-1 group-hover:ring-gray-300",
                      )}
                    >
                      <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-white">
                        <Image
                          src={avatarUrl}
                          alt="Default avatar"
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized={true}
                        />
                      </div>

                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-in zoom-in duration-200" />
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-brand-primary rounded-full flex items-center justify-center shadow-md border border-white z-10">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Upload Your Own</h4>
            <div className="flex flex-col gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant={hasError ? "destructive" : "outline"}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full gap-2",
                  hasError &&
                    "bg-red-50 hover:bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800",
                )}
              >
                <Upload className="h-4 w-4" />
                {previewUrl ? "Change Avatar" : "Browse Files"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Format: JPG, PNG. Max 2MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="submit"
            onClick={handleSave}
            disabled={isDisabled}
          >
            Save Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
