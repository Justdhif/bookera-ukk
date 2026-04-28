"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { CreateDiscussionData, UpdateDiscussionData } from "@/types/discussion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Image as ImageIcon, Send, AlertCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MAX_AVATAR_SIZE as MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from "@/constants/file";

interface DiscussionFormProps {
  initialData?: UpdateDiscussionData;
  onSubmit: (data: CreateDiscussionData) => void;
  submitting?: boolean;
  onCancel?: () => void;
}

export default function DiscussionForm({
  initialData,
  onSubmit,
  submitting = false,
  onCancel,
}: DiscussionFormProps) {
  const t = useTranslations("discussion");
  const [caption, setCaption] = useState(initialData?.caption || "");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(t("invalidFileType"));
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("fileSizeExceed"));
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    if (images.length + files.length > 10) {
      toast.error(t("maxImages"));
      return;
    }

    const validFiles = files.filter(validateFile);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
        setImages(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImages([]);
    setPreviews([]);
    toast.success(t("removeAll"));
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
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error(t("captionRequired"));
      return;
    }
    onSubmit({ caption, images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="caption" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Send className="h-4 w-4" />
          {t("captionLabel")}
        </Label>
        <Textarea
          id="caption"
          name="caption"
          value={caption}
          onChange={handleCaptionChange}
          placeholder={t("captionPlaceholder")}
          className="min-h-[120px] resize-none text-base border-2 focus-visible:ring-brand-primary/20 rounded-2xl p-4 bg-background/50 backdrop-blur-sm"
          disabled={submitting}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t("imagesLabel")}
            </Label>
            <div className="flex items-center gap-3">
                {images.length > 0 && (
                    <button
                        type="button"
                        onClick={clearImages}
                        className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1.5"
                        disabled={submitting}
                    >
                        <Trash2 className="h-3 w-3" />
                        {t("removeAll")}
                    </button>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">
                    {t("maxImages")}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square w-32 shrink-0 rounded-2xl overflow-hidden border-2 border-border/50 group shadow-sm transition-all hover:border-brand-primary/30 snap-start">
              <Image
                src={preview}
                alt={`Preview ${index}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-2 bg-background/90 backdrop-blur-md rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground shadow-md z-10"
                disabled={submitting}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {images.length < 10 && (
            <div
              className={cn(
                "relative aspect-square w-32 shrink-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer group snap-start bg-muted/20",
                isDragging 
                  ? "border-brand-primary bg-brand-primary/5 shadow-[0_0_20px_rgba(var(--brand-primary-rgb,var(--primary-rgb)),0.1)] scale-[0.98]" 
                  : "border-border/60 hover:border-brand-primary/40 hover:bg-muted/40"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("images-upload")?.click()}
            >
              <div className={cn(
                "p-3 rounded-full bg-background border border-border/50 text-muted-foreground transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-110 shadow-sm",
                isDragging && "bg-brand-primary text-white scale-110"
              )}>
                <Upload className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground group-hover:text-brand-primary transition-colors">
                    {t("uploadImages")}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground/50 uppercase">
                    {images.length} / 10
                  </span>
              </div>
              <input
                id="images-upload"
                type="file"
                multiple
                accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                onChange={handleFileChange}
                className="hidden"
                disabled={submitting}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-muted/30 p-3 border border-border/50">
            <AlertCircle className="h-4 w-4 text-brand-primary" />
            <p className="text-[11px] text-muted-foreground font-medium">
                {t("imageConfigInfo")}
            </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all hover:bg-muted/80"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          variant="submit"
          disabled={submitting || !caption.trim()}
          loading={submitting}
          className="flex-2 h-12 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-brand-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
        >
          {t("post")}
        </Button>
      </div>
    </form>
  );
}
