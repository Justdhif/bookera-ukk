"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { discussionPostService, userFollowerService } from "@/services/discussion.service";
import { DiscussionPost, DiscussionUser } from "@/types/discussion";
import { useAuthStore } from "@/store/auth.store";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import EditPostModal from "./post-edit/EditPostModal";
import FollowedUsersList from "./FollowedUsersList";
import DiscussionFeedSkeleton, { FollowedUsersListSkeleton } from "./DiscussionFeedSkeleton";
import EmptyState from "@/components/custom-ui/EmptyState";

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
  const [editingPost, setEditingPost] = useState<DiscussionPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [followedUsers, setFollowedUsers] = useState<DiscussionUser[]>([]);
  const [loadingFollowedUsers, setLoadingFollowedUsers] = useState(true);

  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, initialLoading, router]);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await discussionPostService.getAll({ page: pageNum, per_page: 10 });
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

  useEffect(() => {
    if (!user?.slug) {
      setLoadingFollowedUsers(false);
      setFollowedUsers([]);
      return;
    }
    setLoadingFollowedUsers(true);
    userFollowerService
      .getFollowing(user.slug, { per_page: 15, page: 1 })
      .then((res) => {
        const rows = res.data.data?.data ?? [];
        const mapped: DiscussionUser[] = rows
          .map(({ followable }) => followable)
          .filter((u): u is NonNullable<typeof u> => !!u)
          .map((u) => ({
            id: u.id,
            email: u.email,
            slug: u.slug,
            role: u.role,
            is_following: true,
            profile: u.profile
              ? {
                  full_name: u.profile.full_name,
                  avatar: u.profile.avatar,
                }
              : undefined,
          }));
        setFollowedUsers(mapped);
      })
      .catch(console.error)
      .finally(() => setLoadingFollowedUsers(false));
  }, [user?.slug]);

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

  const handlePostUpdated = (updatedPost: DiscussionPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setEditingPost(updatedPost);
  };

  if (initialLoading || loading) {
    return <DiscussionFeedSkeleton />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6 md:items-start">
        {user?.slug ? (
          <div className="order-1 w-full md:order-2 md:w-80 shrink-0">
            {loadingFollowedUsers ? (
              <FollowedUsersListSkeleton />
            ) : (
              <FollowedUsersList users={followedUsers} />
            )}
          </div>
        ) : null}

        <div className="order-2 w-full md:order-1 md:flex-1 md:min-w-0 md:max-w-2xl space-y-6">
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
                    onEdit={(p) => {
                      setEditingPost(p);
                      setShowEditModal(true);
                    }}
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
        </div>
      </div>

    </div>
  );
}
