"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AxiosError } from "axios";

import PostImageCarousel from "@/components/custom-ui/content/discussion/PostImageCarousel";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost, UpdatePostData } from "@/types/discussion";
import PostEditorModalClient from "../PostEditorModalClient";

interface Props {
  post: DiscussionPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (post: DiscussionPost) => void;
}

const MAX_IMAGES = 10;

export default function EditPostModal({ post, open, onOpenChange, onUpdated }: Props) {
  const t = useTranslations("discussion");

  const [caption, setCaption] = useState(post.caption ?? "");
  const [newImages, setNewImages] = useState<Array<{ file: File; url: string }>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset local state when opening / switching post
  useEffect(() => {
    if (!open) return;
    setCaption(post.caption ?? "");
    setActiveIndex(0);

    setNewImages((prev) => {
      for (const img of prev) URL.revokeObjectURL(img.url);
      return [];
    });
  }, [open, post.slug, post.caption]);

  const newImagesRef = useRef(newImages);
  useEffect(() => {
    newImagesRef.current = newImages;
  }, [newImages]);
  useEffect(() => {
    return () => {
      for (const img of newImagesRef.current) URL.revokeObjectURL(img.url);
    };
  }, []);

  const combinedImages = useMemo(() => {
    const existing = (post.images ?? []).map((img) => ({
      kind: "existing" as const,
      key: `existing-${img.id}`,
      src: img.image_path,
    }));

    const newlyAdded = newImages.map((img, i) => ({
      kind: "new" as const,
      key: `new-${i}-${img.url}`,
      src: img.url,
      newIndex: i,
    }));

    return [...existing, ...newlyAdded];
  }, [post.images, newImages]);

  const canAddMore = combinedImages.length < MAX_IMAGES;
  const carouselImages = useMemo(
    () => combinedImages.map((img) => ({ image_path: img.src })),
    [combinedImages]
  );

  useEffect(() => {
    if (combinedImages.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= combinedImages.length) {
      setActiveIndex(combinedImages.length - 1);
    }
  }, [combinedImages.length, activeIndex]);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/"));

    const remaining = MAX_IMAGES - (post.images?.length ?? 0) - newImages.length;
    if (remaining <= 0) return;

    const accepted = valid.slice(0, remaining).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    if (accepted.length === 0) return;

    setNewImages((prev) => [...prev, ...accepted]);
  };

  const removeNewImage = (newIndex: number) => {
    setNewImages((prev) => {
      const target = prev[newIndex];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== newIndex);
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: UpdatePostData = {
        caption,
        images: newImages.map((x) => x.file),
      };
      const res = await discussionPostService.update(post.slug, payload);
      onUpdated?.(res.data.data);
      onOpenChange(false);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message || t("failedUpdatePost"));
    } finally {
      setSubmitting(false);
    }
  };


  const initials = useMemo(() => {
    const name = post.user.profile?.full_name ?? post.user.email ?? "";
    return name
      ? name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  }, [post.user.profile?.full_name, post.user.email]);

  return (
    <PostEditorModalClient
      open={open}
      onOpenChange={onOpenChange}
      title={t("editPostTitle")}
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
              <p className="text-lg font-bold leading-tight">{t("editPostTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {combinedImages.length}/{MAX_IMAGES}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-brand-primary/20">
              <AvatarImage src={post.user.profile?.avatar} alt={post.user.profile?.full_name || post.user.email || "User"} />
              <AvatarFallback className="bg-brand-primary text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{post.user.profile?.full_name ?? post.user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{post.user.email}</p>
            </div>
          </div>
        </>
      }
      body={
        <>
          {/* Thumbnails (horizontal scroll) */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span />
              <span>
                {combinedImages.length}/{MAX_IMAGES}
              </span>
            </div>
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto p-2">
              {combinedImages.map((img, i) => (
                <div
                  key={img.key}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex(i);
                    }
                  }}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted",
                    i === activeIndex && "ring-2 ring-brand-primary ring-offset-2 ring-offset-background",
                  )}
                  aria-label={`Select ${i + 1}`}
                  role="button"
                  tabIndex={0}
                >
                  <Image
                    src={img.src}
                    alt={`Thumb ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={img.src.startsWith("blob:")}
                  />

                  {img.kind === "new" ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNewImage(img.newIndex);
                      }}
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      aria-label="Hapus gambar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
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
              placeholder={t("captionEditPlaceholder")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={10}
              className="mt-2 resize-none"
              maxLength={1000}
            />
            <div className="mt-2 flex items-center justify-end text-xs text-muted-foreground">
              <span>{caption.length}/1000</span>
            </div>
          </div>
        </>
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="submit"
            loading={submitting}
            disabled={
              submitting ||
              (!caption.trim() && (post.images?.length ?? 0) === 0 && newImages.length === 0)
            }
          >
            {t("saveChanges")}
          </Button>
        </>
      }
    />
  );
}
