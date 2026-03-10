"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionPost } from "@/types/discussion";
import PostCard from "@/components/custom-ui/content/discussion/PostCard";

export default function FollowingFeedPageClient() {
  const router = useRouter();
  const t = useTranslations("discussion");
  const { isAuthenticated, initialLoading } = useAuthStore();

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const res = await discussionPostService.getFollowingPosts({ page: pageNum, per_page: 10 });
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

  if (initialLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t("followingTitle")}</h1>
      <p className="text-sm text-muted-foreground -mt-4">
        {t("followingDesc")}
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">
            {t("noFollowingPosts")}
          </p>
          <Button variant="outline" onClick={() => router.push("/discussion")}>
            {t("findPeopleToFollow")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={handleDeleted}
              feedMode={true}
            />
          ))}

          {page < lastPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
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
