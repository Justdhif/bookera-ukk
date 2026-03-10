"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost, DiscussionPostImage } from "@/types/discussion";

export default function EditPostClient() {
  const t = useTranslations("discussion");
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [existingImages, setExistingImages] = useState<DiscussionPostImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Derive storage base from API URL (strip /api suffix) - same as DiscussionPostCard
  const storageBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api", "");

  useEffect(() => {
    (async () => {
      try {
        const res = await discussionPostService.getPost(slug);
        const data = res.data.data;
        setPost(data);
        setCaption(data.caption ?? "");
        setExistingImages(data.images ?? []);
      } catch {
        toast.error(t("failedLoadPost"));
        router.push("/discussion");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, router]);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    const combined = [...newFiles, ...valid].slice(0, 10 - existingImages.length);
    setNewFiles(combined);
    setNewPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!caption.trim() && existingImages.length === 0 && newFiles.length === 0) {
      toast.error(t("addCaptionOrImage"));
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (caption.trim()) formData.append("caption", caption.trim());
      newFiles.forEach((f) => formData.append("images[]", f));
      await discussionPostService.updatePost(slug, formData);
      toast.success(t("postUpdated"));
      router.push(`/discussion/${slug}`);
    } catch {
      toast.error(t("failedUpdatePost"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("cancel")}
      </Button>

      <h1 className="text-xl font-bold">{t("editPostTitle")}</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="caption">{t("caption")}</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="mt-1 resize-none"
            maxLength={1000}
            placeholder={t("captionEditPlaceholder")}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {caption.length}/1000
          </p>
        </div>

        {/* Existing images (read-only) */}
        {existingImages.length > 0 && (
          <div>
            <Label className="mb-1 block text-sm">{t("currentImages")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={`${storageBase}/storage/${img.image_path}`}
                    alt={`Gambar ${img.order}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("existingImagesNote")}
            </p>
          </div>
        )}

        {/* New image previews */}
        {newPreviews.length > 0 && (
          <div>
            <Label className="mb-1 block text-sm">{t("newImages")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {newPreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image src={src} alt={`Baru ${i + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => {
                      setNewFiles((prev) => prev.filter((_, j) => j !== i));
                      setNewPreviews((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={existingImages.length + newFiles.length >= 10}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Tambah Gambar Baru
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

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {t("saveChanges")}
      </Button>
    </div>
  );
}
