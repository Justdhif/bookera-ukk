"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { News } from "@/types/news";
import { newsService } from "@/services/news.service";
import { buildNewsFormData } from "@/services/form-data/news.form-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { X, Upload, FileText, Send, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface NewsFormProps {
  initialData?: News | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewsForm({
  initialData,
  onSuccess,
  onCancel,
}: NewsFormProps) {
  const t = useTranslations("news");
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setContent(initialData?.content || "");
    setImagePreview(initialData?.image || null);
    setImage(null);
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("uploadHint"));
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const formData = buildNewsFormData({ title, content, image });

      if (initialData) {
        await newsService.adminUpdateNews(initialData.id, formData);
        toast.success(t("newsUpdated"));
      } else {
        await newsService.adminCreateNews(formData);
        toast.success(t("newsCreated"));
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <StaggerContainer className="space-y-6 pt-2">
        <FadeUp delay={0.1}>
          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("newsTitle")}
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("newsTitlePlaceholder")}
              className="h-12 border-2 focus-visible:ring-brand-primary/20 rounded-2xl px-4 bg-background/50 backdrop-blur-sm"
              disabled={loading}
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Send className="h-4 w-4" />
              {t("newsContent")}
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("newsContentPlaceholder")}
              className="min-h-40 resize-none text-base border-2 focus-visible:ring-brand-primary/20 rounded-2xl p-4 bg-background/50 backdrop-blur-sm"
              disabled={loading}
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="space-y-3">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t("newsImage")}
            </Label>
            <div className="flex flex-col gap-4">
              {imagePreview && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-border/50 group shadow-md transition-all hover:border-brand-primary/30">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImage(null);
                      }}
                      className="bg-destructive text-white p-3 rounded-full hover:bg-destructive/90 transition-all scale-90 group-hover:scale-100 shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="news-image-upload"
                  disabled={loading}
                />
                {!imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "relative w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer group bg-muted/20 border-border/60 hover:border-brand-primary/40 hover:bg-muted/40",
                    )}
                    onClick={() => document.getElementById("news-image-upload")?.click()}
                  >
                    <div className="p-3 rounded-full bg-background border border-border/50 text-muted-foreground transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-110 shadow-sm">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground group-hover:text-brand-primary transition-colors">
                        {t("uploadImage")}
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground/50 uppercase italic">
                        {t("uploadHint")}
                      </span>
                    </div>
                  </Button>
                )}
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-2 font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-muted/80 gap-2"
                    onClick={() => document.getElementById("news-image-upload")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {t("changeImage")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all hover:bg-muted/80"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="submit"
              disabled={loading || !title.trim() || !content.trim()}
              loading={loading}
              className="flex-2 h-12 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {initialData ? t("editNews") : t("addNews")}
            </Button>
          </div>
        </FadeUp>
      </StaggerContainer>
    </form>
  );
}
