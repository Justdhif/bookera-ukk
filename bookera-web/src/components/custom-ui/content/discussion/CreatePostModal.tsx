"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, ImagePlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { discussionPostService, CreatePostData } from "@/services/discussion.service";
import { DiscussionPost } from "@/types/discussion";

interface Props {
  onClose: () => void;
  onCreated: (post: DiscussionPost) => void;
}

export default function CreatePostModal({ onClose, onCreated }: Props) {
  const t = useTranslations("discussion");
  const [formData, setFormData] = useState<CreatePostData>({ caption: "", images: [] });
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    const combined = [...(formData.images ?? []), ...valid].slice(0, 10);
    setFormData((prev) => ({ ...prev, images: combined }));
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    const nextFiles = (formData.images ?? []).filter((_, i) => i !== idx);
    const nextPreviews = previews.filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, images: nextFiles }));
    setPreviews(nextPreviews);
  };

  const handleSubmit = async () => {
    if (!formData.caption?.trim() && (formData.images ?? []).length === 0) {
      toast.error(t("addCaptionOrImageFirst"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await discussionPostService.createPost(formData);
      onCreated(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("failedCreatePost"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createPostTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="caption">{t("caption")}</Label>
            <Textarea
              id="caption"
              placeholder={t("captionPlaceholder")}
              value={formData.caption ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
              rows={4}
              className="mt-1 resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {(formData.caption ?? "").length}/1000
            </p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={src}
                    alt={`Preview ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="submit"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={(formData.images ?? []).length >= 10}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {(formData.images ?? []).length === 0
              ? t("addImage")
              : t("addImageCount", { count: (formData.images ?? []).length })}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <DialogFooter>
          <Button variant="submit" onClick={onClose} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (!formData.caption?.trim() && (formData.images ?? []).length === 0)} variant="submit"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
