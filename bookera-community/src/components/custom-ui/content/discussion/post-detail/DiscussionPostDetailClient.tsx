"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageSquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost } from "@/types/discussion";
import PostImageCarousel from "@/components/custom-ui/content/discussion/PostImageCarousel";
import PostDetailPanel from "@/components/custom-ui/content/discussion/post-detail/PostDetailPanel";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DiscussionPostDetailClient() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("discussion");
  const slug = params.slug as string;

  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await discussionPostService.getBySlug(slug);
        setPost(res.data.data);
      } catch {
        setNotFound(true);
        toast.error(t("postNotFound"));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleDeleted = () => {
    router.push("/discussion");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-28 rounded" />
        <div className="overflow-hidden rounded-2xl border border-border/60 shadow-sm bg-card">
          <div className="md:flex md:h-[calc(100vh-12rem)]">
            <Skeleton className="w-full aspect-square md:aspect-auto md:w-1/2 md:h-full shrink-0" />
            <div className="flex flex-col gap-4 p-4 md:w-1/2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
              <div className="space-y-3 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <EmptyState
        icon={<MessageSquareOff />}
        title={t("postNotFoundTitle")}
        actionLabel={t("backToFeed")}
        onAction={() => router.push("/discussion")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Button>

      <div className="overflow-hidden rounded-2xl border border-border/60 shadow-sm bg-card">
        <div className="md:flex md:h-[calc(100vh-12rem)]">
          {post.images.length > 0 && (
            <div className="w-full aspect-square md:aspect-auto md:w-1/2 md:h-full shrink-0 bg-black">
              <div className="relative h-full">
                <PostImageCarousel
                  images={post.images}
                  className="rounded-none h-full"
                  fillHeight={true}
                />

                {post.followed_likers && post.followed_likers.length > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center -space-x-2">
                    {post.followed_likers.slice(0, 3).map((likerUser) => {
                      const name = likerUser.profile?.full_name ?? likerUser.email ?? "";
                      const initial = name[0]?.toUpperCase() ?? "U";
                      return (
                        <div key={likerUser.id} className="relative">
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage
                              src={
                                likerUser.profile?.avatar ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${likerUser.email}`
                              }
                              alt={likerUser.profile?.full_name}
                            />
                            <AvatarFallback className="text-[10px] bg-linear-to-br from-pink-500 to-purple-600 text-white">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <Heart className="absolute -bottom-1 -right-1 h-4 w-4 text-destructive fill-destructive" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            className={cn(
              "flex flex-col overflow-hidden h-150 md:h-full",
              "border-t border-border/40 md:border-t-0",
              post.images.length > 0
                ? "md:w-1/2 md:border-l md:border-border/40"
                : "w-full",
            )}
          >
            <PostDetailPanel
              post={post}
              onDeleted={handleDeleted}
              onUpdated={(updated) => setPost(updated)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
