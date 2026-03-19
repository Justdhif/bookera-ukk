"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost, CreatePostData } from "@/types/discussion";
import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AxiosError } from "axios";
import PostImageCarousel from "@/components/custom-ui/content/discussion/PostImageCarousel";
import PostEditorModalClient from "./PostEditorModalClient";

interface Props {
  onClose: () => void;
  onCreated: (post: DiscussionPost) => void;
}

const MAX_IMAGES = 10;

export default function CreatePostModal({ onClose, onCreated }: Props) {
  const t = useTranslations("discussion");
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<CreatePostData>({ caption: "", images: [] });
  const [images, setImages] = useState<Array<{ file: File; url: string }>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    return () => {
      for (const img of imagesRef.current) URL.revokeObjectURL(img.url);
    };
  }, []);

  const canAddMore = images.length < MAX_IMAGES;
  const carouselImages = useMemo(() => images.map((img) => ({ image_path: img.url })), [images]);

  useEffect(() => {
    if (images.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= images.length) {
      setActiveIndex(images.length - 1);
    }
  }, [images.length, activeIndex]);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;

    const accepted = valid.slice(0, remaining).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    if (accepted.length === 0) return;

    setImages((prev) => {
      const next = [...prev, ...accepted];
      return next;
    });
    setFormData((curr: CreatePostData) => ({
      ...curr,
      images: [...(curr.images ?? []), ...accepted.map((x) => x.file)].slice(0, MAX_IMAGES),
    }));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      const next = prev.filter((_, i) => i !== idx);
      setFormData((curr: CreatePostData) => ({ ...curr, images: next.map((x) => x.file) }));
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formData.caption?.trim() && images.length === 0) {
      toast.error(t("addCaptionOrImageFirst"));
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreatePostData = {
        caption: formData.caption ?? "",
        images: images.map((x) => x.file),
      };
      const res = await discussionPostService.create(payload);
      onCreated(res.data.data);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message || t("failedCreatePost"));
    } finally {
      setSubmitting(false);
    }
  };


  const initials = useMemo(() => {
    const name = user?.profile?.full_name ?? user?.email ?? "";
    return name
      ? name
          .split(" ")
          .slice(0, 2)
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  }, [user]);

  const activeThumbIndex = activeIndex < images.length ? activeIndex : -1;

  return (
    <PostEditorModalClient
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t("createPostTitle")}
      left={
        carouselImages.length > 0 ? (
          <PostImageCarousel
            images={carouselImages}
            fillHeight
            currentIndex={activeIndex}
            onIndexChange={setActiveIndex}
            className="h-full w-full"
          />
        ) : (
          <div className="h-full grid place-items-center">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              className="group rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-left hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center ring-1 ring-white/10">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white font-semibold">{t("addImage")}</p>
                  <p className="text-white/70 text-xs">{t("addCaptionOrImageFirst")}</p>
                </div>
              </div>
            </Button>
          </div>
        )
      }
      header={
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold leading-tight">{t("createPostTitle")}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {images.length}/{MAX_IMAGES}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-brand-primary/20">
              <AvatarImage src={user?.profile?.avatar} alt={user?.profile?.full_name || user?.email || "User"} />
              <AvatarFallback className="bg-brand-primary text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.profile?.full_name ?? user?.email ?? ""}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
          </div>
        </>
      }
      body={
        <>
          {/* Thumbnails (scroll horizontal) */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span />
              <span>
                {images.length}/{MAX_IMAGES}
              </span>
            </div>
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div
                  key={img.url}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex(i);
                    }
                  }}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted",
                    i === activeThumbIndex &&
                      "ring-2 ring-brand-primary ring-offset-2 ring-offset-background",
                  )}
                  aria-label={`Select ${i + 1}`}
                  role="button"
                  tabIndex={0}
                >
                  <Image src={img.url} alt={`Thumb ${i + 1}`} fill className="object-cover" unoptimized />

                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Hapus gambar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              {canAddMore && (
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  className="h-16 w-16 shrink-0 rounded-lg border border-dashed border-brand-primary/40 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary flex flex-col items-center justify-center gap-1 transition-colors"
                  aria-label={t("addImage")}
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[11px] font-semibold">+</span>
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
          </div>

          <div className="mt-5">
            <Label htmlFor="caption">{t("caption")}</Label>
            <Textarea
              id="caption"
              placeholder={t("captionPlaceholder")}
              value={formData.caption ?? ""}
              onChange={(e) => setFormData((prev: CreatePostData) => ({ ...prev, caption: e.target.value }))}
              rows={10}
              className="mt-2 resize-none"
              maxLength={1000}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span />
              <span>{(formData.caption ?? "").length}/1000</span>
            </div>
          </div>
        </>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="submit"
            loading={submitting}
            disabled={submitting || (!formData.caption?.trim() && images.length === 0)}
          >
            {t("publish")}
          </Button>
        </>
      }
    />
  );
}
