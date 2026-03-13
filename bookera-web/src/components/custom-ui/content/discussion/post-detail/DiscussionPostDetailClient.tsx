"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost } from "@/types/discussion";
import PostImageCarousel from "@/components/custom-ui/content/discussion/PostImageCarousel";
import PostDetailPanel from "@/components/custom-ui/content/discussion/post-detail/PostDetailPanel";
import EmptyState from "@/components/custom-ui/EmptyState";

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
        const res = await discussionPostService.getPost(slug);
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        variant="brand"
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
              <PostImageCarousel
                images={post.images}
                className="rounded-none h-full"
                fillHeight={true}
              />
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
            <PostDetailPanel post={post} onDeleted={handleDeleted} />
          </div>
        </div>
      </div>
    </div>
  );
}
