"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost } from "@/types/discussion";
import { useAuthStore } from "@/store/auth.store";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import FollowedUsersList from "./FollowedUsersList";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

function DiscussionFeedSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6 md:items-start">
        <div className="w-full md:flex-1 md:min-w-0 md:max-w-2xl space-y-4">
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
        <div className="hidden md:block w-80 space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
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

export default function DiscussionFeedPageClient() {
  const router = useRouter();
  const t = useTranslations("discussion");
  const { user, isAuthenticated, initialLoading } = useAuthStore();

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, initialLoading, router]);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await discussionPostService.getPosts({ page: pageNum, per_page: 10 });
      const paginated = res.data.data;

      setPosts((prev) => (append ? [...prev, ...paginated.data] : paginated.data));
      setLastPage(paginated.last_page);
    } catch {
      toast.error(t("failedLoadPosts"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const handlePostCreated = (newPost: DiscussionPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowCreateModal(false);
    toast.success(t("postCreatedSuccess"));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (initialLoading || loading) {
    return <DiscussionFeedSkeleton />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6 md:items-start">
        <div className="w-full md:flex-1 md:min-w-0 md:max-w-2xl space-y-6">
          {posts.length === 0 ? (
            <EmptyState icon={<MessageSquare />} description={t("noPosts")} />
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id}>
                  <PostCard
                    key={post.id}
                    post={post}
                    onDeleted={handlePostDeleted}
                    feedMode={true}
                  />
                </div>
              ))}

              {page < lastPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {t("loadMore")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Create post modal */}
          {showCreateModal && (
            <CreatePostModal
              onClose={() => setShowCreateModal(false)}
              onCreated={handlePostCreated}
            />
          )}
        </div>

        {user?.slug ? (
          <div className="w-full md:w-80 shrink-0">
            <FollowedUsersList userSlug={user.slug} />
          </div>
        ) : null}
      </div>

    </div>
  );
}
