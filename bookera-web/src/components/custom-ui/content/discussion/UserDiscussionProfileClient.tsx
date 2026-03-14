"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, BookOpen, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { userFollowerService, discussionPostService } from "@/services/discussion.service";
import { useAuthStore } from "@/store/auth.store";
import { User } from "@/types/user";
import { DiscussionPost, FollowCounts } from "@/types/discussion";
import PostCard from "./PostCard";
import { UserDiscussionProfileHeader } from "./UserDiscussionProfileHeader";

export default function UserDiscussionProfileClient() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("discussion");
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const slug = params.slug as string;

  const [profile, setProfile] = useState<User | null>(null);
  const [followCounts, setFollowCounts] = useState<FollowCounts | null>(null);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const [profileRes, countsRes] = await Promise.all([
        userFollowerService.getUserPublicProfile(slug),
        userFollowerService.getFollowCounts(slug),
      ]);
      const userData = profileRes.data.data;
      setProfile(userData);
      setFollowCounts(countsRes.data.data);
      setFollowing(!!userData.is_following);
    } catch {
      toast.error(t("failedLoadProfile"));
      router.back();
    } finally {
      setLoadingProfile(false);
    }
  }, [slug, router, t]);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoadingPosts(true);
      const res = await discussionPostService.getPostsByUser(slug, { page: pageNum, per_page: 12 });
      const data = res.data.data;
      if (append) {
        setPosts((prev) => [...prev, ...data.data]);
      } else {
        setPosts(data.data);
      }
      setHasMore(data.current_page < data.last_page);
    } catch {
      toast.error(t("failedLoadPosts"));
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, [slug, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setPage(1);
      fetchPosts(1, false);
    }
  }, [profile, fetchPosts]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, true);
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (following) {
        await userFollowerService.unfollow(profile.id);
        setFollowing(false);
        setFollowCounts((prev) =>
          prev ? { ...prev, followers_count: Math.max(0, prev.followers_count - 1) } : prev,
        );
      } else {
        await userFollowerService.follow(profile.id);
        setFollowing(true);
        setFollowCounts((prev) =>
          prev ? { ...prev, followers_count: prev.followers_count + 1 } : prev,
        );
      }
    } catch {
      toast.error(following ? t("failedUnfollow") : t("failedFollow"));
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === profile?.id;

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Button>

      <UserDiscussionProfileHeader
        profile={profile}
        followCounts={followCounts}
        following={following}
        followLoading={followLoading}
        isOwnProfile={isOwnProfile}
        onFollow={handleFollow}
      />

      {/* Posts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            {t("postsLabel")}
          </h2>
        </div>

        {loadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <ImageOff className="h-10 w-10 opacity-40" />
            <p className="text-sm">{t("noPostsYet")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                feedMode={false}
              />
            ))}

            {hasMore && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? t("loading") : t("loadMore")}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
