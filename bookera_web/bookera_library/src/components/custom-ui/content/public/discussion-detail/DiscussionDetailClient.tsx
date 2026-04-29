"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { discussionService } from "@/services/discussion.service";
import { DiscussionPost, DiscussionComment } from "@/types/discussion";
import { useAuthStore } from "@/store/auth.store";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import PublicDiscussionGrid from "../PublicDiscussionGrid";

import {
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Reply,
  Trash2,
  AlertTriangle,
  LogIn,
  X,
  ShieldAlert,
} from "lucide-react";

import CommentSection from "@/components/custom-ui/CommentSection";
import ImageCarousel from "@/components/custom-ui/ImageCarousel";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";

export default function DiscussionDetailClient() {
  const t = useTranslations("discussion");
  const params = useParams();
  const slug = params.slug as string;
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? idLocale : enUS;

  const { user } = useAuthStore();

  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likePending, setLikePending] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    discussionService
      .getBySlug(slug)
      .then((res) => {
        const data = res.data.data;
        setPost(data);
        setLiked(data.is_liked ?? false);
        setLikesCount(data.likes_count);
      })
      .catch(() => toast.error(t("loadError")))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleToggleLike = async () => {
    if (!user) {
      toast.error(t("loginToLike"));
      return;
    }
    if (likePending) return;
    setLikePending(true);
    try {
      const res = await discussionService.toggleLike(slug);
      setLiked(res.data.data.liked);
      setLikesCount(res.data.data.likes_count);
    } catch {
      toast.error(t("likeError"));
    } finally {
      setLikePending(false);
    }
  };

  const images = post?.images ?? [];
  const profile = post?.user?.profile;
  const avatarUrl = profile?.avatar || "";
  const displayName =
    profile?.full_name || post?.user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDesc")}
        showBackButton
        isAdmin={false}
      />

      {loading ? (
        <DataLoading size="lg" />
      ) : !post ? (
        <EmptyState
          icon={<AlertTriangle />}
          title={t("notFound")}
          description={t("notFoundDesc")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-5 order-2 lg:order-2">
              <CommentSection
                entitySlug={slug}
                commentCount={post.comments_count}
                onCommentCountChange={(count) =>
                  setPost((prev) => (prev ? { ...prev, comments_count: count } : prev))
                }
                namespace="discussion"
                getComments={discussionService.getComments}
                createComment={discussionService.createComment}
                getReplies={discussionService.getReplies}
                deleteComment={discussionService.deleteComment}
              />
            </div>

            {/* Left side: Post card */}
            <div className="lg:col-span-7 order-1 lg:order-1 space-y-4 lg:sticky lg:top-4 h-fit">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-muted/60 bg-card/60 backdrop-blur-md">
                  <CardContent className="p-5 space-y-4">
                    {/* Author row */}
                    <div className="flex items-center gap-3">
                      <Link href={`/${post.user?.slug}/profile`}>
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm hover:border-brand-primary/40 transition-colors">
                          <AvatarImage
                            src={avatarUrl}
                            alt={displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link
                            href={`/${post.user?.slug}/profile`}
                            className="text-sm font-bold hover:text-brand-primary transition-colors truncate"
                          >
                            {displayName}
                          </Link>
                          <div className="flex items-center gap-1 shrink-0">
                            {post.user?.role === "admin" && <AdminBadge className="h-4 px-1.5 text-[8px]" />}
                            {post.user?.profile?.gender === "croissant" && <CroissantBadge className="h-4 px-1.5 text-[8px]" />}
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          @{post.user?.email?.split("@")[0]} ·{" "}
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Caption */}
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {post.caption}
                    </p>

                    {/* Image Carousel */}
                    {images.length > 0 && <ImageCarousel images={images} />}

                    {/* Actions */}
                    <div className="flex items-center gap-5 pt-1 border-t border-muted/50">
                      <button
                        onClick={handleToggleLike}
                        disabled={likePending}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
                          liked
                            ? "text-rose-500"
                            : "text-muted-foreground hover:text-rose-500"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 transition-all duration-200 ${liked ? "fill-rose-500 scale-110" : ""}`}
                        />
                        <span>{likesCount}</span>
                        <span className="hidden sm:inline text-xs">
                          {t("likes")}
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                        <span className="hidden sm:inline text-xs">
                          {t("comments")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          <PublicDiscussionGrid />
        </>
      )}
    </div>
  );
}
