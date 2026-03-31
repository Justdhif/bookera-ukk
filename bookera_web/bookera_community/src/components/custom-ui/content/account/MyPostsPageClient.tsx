"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost } from "@/types/discussion";
import { useAuthStore } from "@/store/auth.store";
import PostCard from "@/components/custom-ui/content/discussion/PostCard";
import EditPostModal from "@/components/custom-ui/content/discussion/post-edit/EditPostModal";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const PER_PAGE = 10;

export default function MyPostsPageClient() {
  const t = useTranslations("profile");
  const { user } = useAuthStore();

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [editingPost, setEditingPost] = useState<DiscussionPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchPosts = useCallback(
    async (page: number, append = false) => {
      if (!user) return;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await discussionPostService.getByUser(user.slug ?? String(user.id), {
          page,
          per_page: PER_PAGE,
        });
        const paginated = res.data.data;
        const items = paginated.data ?? [];
        const lastPage = paginated.last_page ?? 1;

        setPosts((prev) => (append ? [...prev, ...items] : items));
        setHasMore(page < lastPage);
        setCurrentPage(page);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost: DiscussionPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setEditingPost(updatedPost);
  };

  const loadMore = () => {
    fetchPosts(currentPage + 1, true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-brand-primary rounded-lg">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t("myPosts")}</h1>
          <p className="text-muted-foreground">{t("myPostsDesc")}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<MessageSquare />}
          title={t("noPosts")}
          description={t("noPostsDesc")}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={handlePostDeleted}
              onEdit={(p) => {
                setEditingPost(p);
                setShowEditModal(true);
              }}
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

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="brand"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    {t("loadMore")}
                  </span>
                ) : (
                  t("loadMore")
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
