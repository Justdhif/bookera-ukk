"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Check,
  FileWarning,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  DEFAULT_AVATARS,
} from "@/constants/avatar";

const iconPopTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  delay: 0.2,
};


interface SetupStepAvatarProps {
  avatarFile: File | string | null;
  setAvatarFile: (v: File | string | null) => void;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export default function SetupStepAvatar({
  avatarFile,
  setAvatarFile,
  loading,
  onBack,
  onSubmit,
}: SetupStepAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(() => {
    if (typeof avatarFile === "string") return avatarFile;
    return "";
  });
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasError = !!localError;

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const msg = "Invalid file type. Please upload JPG, JPEG, or PNG only.";
      setLocalError(msg);
      toast.error(msg);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      const msg = "File size exceeds 2MB limit. Please choose a smaller image.";
      setLocalError(msg);
      toast.error(msg);
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
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
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultAvatarClick = (url: string) => {
    setAvatarFile(url);
    setPreviewUrl(url);
    setLocalError(null);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreviewUrl("");
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <CardHeader className="space-y-4 text-center pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={iconPopTransition}
          className="flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Camera className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Choose Your Avatar
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">
            Pick a default avatar or upload your own photo (optional)
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        <div
          className={cn(
            "relative flex flex-col items-center gap-4 p-6 rounded-xl transition-all duration-200",
            !previewUrl && "cursor-pointer border-2 border-dashed",
            isDragging && "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10",
            hasError
              ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
              : !previewUrl
              ? "border-gray-300 dark:border-gray-700"
              : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!previewUrl) fileInputRef.current?.click();
          }}
        >
          {previewUrl ? (
            <>
              <div className="relative h-28 w-28">
                <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-brand-primary/20 dark:ring-brand-primary/30">
                  <Image
                    src={previewUrl}
                    alt="Avatar preview"
                    fill
                    sizes="112px"
                    className="object-cover"
                    unoptimized
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
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove avatar</span>
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avatar selected
              </p>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "p-4 rounded-full",
                  isDragging
                    ? "bg-brand-primary/10 dark:bg-brand-primary/20"
                    : hasError
                    ? "bg-red-100 dark:bg-red-900/50 animate-shake"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                {hasError ? (
                  <FileWarning className="h-10 w-10 text-red-600 dark:text-red-400" />
                ) : previewUrl === "" && !isDragging ? (
                  <UserIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Upload
                    className={cn(
                      "h-10 w-10",
                      isDragging ? "text-brand-primary" : "text-gray-400 dark:text-gray-500"
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
                    <p className="text-xs text-red-600 dark:text-red-400/80 max-w-xs">
                      {localError}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isDragging ? "Drop your image here" : "No avatar selected"}
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

        <Input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FILE_EXTENSIONS.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Default Avatars
          </Label>
          <div className="grid grid-cols-6 gap-2">
            {DEFAULT_AVATARS.map((url) => {
              const isSelected = previewUrl === url;
              return (
                <Button
                  key={url}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDefaultAvatarClick(url)}
                  className="relative h-auto w-auto p-0 hover:bg-transparent group"
                >
                  <div
                    className={cn(
                      "relative rounded-full transition-all duration-200",
                      isSelected
                        ? "ring-2 ring-offset-2 ring-brand-primary ring-offset-background scale-105"
                        : "group-hover:scale-105 group-hover:ring-1 group-hover:ring-gray-300"
                    )}
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                      <Image
                        src={url}
                        alt="Default avatar option"
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-brand-primary/20 rounded-full" />
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
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Upload Your Own
          </Label>
          <Button
            type="button"
            variant={hasError ? "destructive" : "outline"}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full gap-2 border-gray-300 dark:border-gray-600 hover:border-brand-primary/50 transition-all",
              hasError &&
                "bg-red-50 hover:bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800"
            )}
            disabled={loading}
          >
            <Upload className="h-4 w-4" />
            {previewUrl ? "Change Photo" : "Browse Files"}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Format: JPG, PNG · Max 2MB
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="h-12 px-5 rounded-lg border-gray-300 dark:border-gray-600 hover:border-brand-primary/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            type="button"
            variant="submit"
            onClick={onSubmit}
            loading={loading}
            disabled={loading || hasError}
            className="flex-1 h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
            spinnerClassName="text-white"
          >
            {loading ? "Saving..." : (
              <>
                Save & Start Exploring
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
