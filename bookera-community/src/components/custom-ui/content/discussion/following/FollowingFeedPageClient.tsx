"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost } from "@/types/discussion";
import PostCard from "@/components/custom-ui/content/discussion/PostCard";
import EditPostModal from "@/components/custom-ui/content/discussion/post-edit/EditPostModal";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

function FollowingFeedSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-80 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FollowingFeedPageClient() {
  const router = useRouter();
  const t = useTranslations("discussion");
  const { isAuthenticated, initialLoading } = useAuthStore();

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingPost, setEditingPost] = useState<DiscussionPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const res = await discussionPostService.getByFollowing({ page: pageNum, per_page: 10 });
      const paginated = res.data.data;
      setPosts((prev) => (append ? [...prev, ...paginated.data] : paginated.data));
      setLastPage(paginated.last_page);
    } catch {
      toast.error(t("failedLoadFollowingFeed"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    if (!initialLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else {
        fetchPosts(1);
      }
    }
  }, [initialLoading, isAuthenticated, fetchPosts, router]);

  const handleDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost: DiscussionPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setEditingPost(updatedPost);
  };

  if (initialLoading || loading) {
    return <FollowingFeedSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t("followingTitle")}</h1>
      <p className="text-sm text-muted-foreground -mt-4">
        {t("followingDesc")}
      </p>

      {posts.length === 0 ? (
        <EmptyState
          icon={<MessageSquare />}
          description={t("noFollowingPosts")}
          actionLabel={t("findPeopleToFollow")}
          onAction={() => router.push("/discussion")}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={handleDeleted}
              onEdit={(p) => {
                setEditingPost(p);
                setShowEditModal(true);
              }}
              feedMode={true}
            />
          ))}

          {editingPost && (
            <EditPostModal
              post={editingPost}
              open={showEditModal}
              onOpenChange={(open) => {
                setShowEditModal(open);
                if (!open) setEditingPost(null);
              }}
              onUpdated={handlePostUpdated}
            />
          )}

          {page < lastPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchPosts(next, true);
                }}
                disabled={loadingMore}
              >
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t("loadMore")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
