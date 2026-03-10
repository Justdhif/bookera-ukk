"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, User2, Building2, BookOpen, Heart, HeartOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { followService } from "@/services/follow.service";
import { FollowableType, FollowableDetail } from "@/types/follow";
import { useAuthStore } from "@/store/auth.store";
import FollowDetailBookList from "./FollowDetailBookList";

interface FollowDetailClientProps {
  type: "author" | "publisher";
}

export default function FollowDetailClient({ type }: FollowDetailClientProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const [detail, setDetail] = useState<FollowableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isAuthor = type === "author";
  const Icon = isAuthor ? User2 : Building2;
  const typeLabel = isAuthor ? "Author" : "Publisher";

  const fetchDetail = async () => {
    try {
      const res = await followService.getFollowableDetail(type, slug);
      setDetail(res.data.data);
    } catch {
      toast.error(`Failed to load ${typeLabel.toLowerCase()}`);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error(`Please login to follow ${typeLabel.toLowerCase()}s`);
      router.push("/login");
      return;
    }
    if (!detail) return;
    setFollowLoading(true);
    try {
      if (detail.is_following) {
        await followService.unfollow(type, detail.id);
        toast.success(`Unfollowed ${detail.name}`);
        setDetail({ ...detail, is_following: false });
        window.dispatchEvent(new Event("refreshFollowsList"));
        router.push("/");
      } else {
        await followService.follow(type, detail.id);
        toast.success(`Now following ${detail.name}`);
        setDetail({ ...detail, is_following: true });
        window.dispatchEvent(new Event("refreshFollowsList"));
      }
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        <div className="space-y-4 mb-6">
          <Skeleton className="h-8 w-20" />
          <div className="flex flex-col lg:flex-row gap-6">
            <Skeleton className="w-40 h-40 rounded-full lg:w-48 lg:h-48 shrink-0" />
            <div className="flex flex-col justify-end flex-1 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-3/4 max-w-xl" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-3/4 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const description = isAuthor ? detail.bio : detail.description;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Photo */}
          <div className="shrink-0">
            <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden shadow-lg ring-4 ring-border">
              {detail.photo_url ? (
                <img
                  src={detail.photo_url}
                  alt={detail.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Icon className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end flex-1">
            <p className="text-muted-foreground text-sm">{typeLabel}</p>
            <h1 className="lg:text-6xl sm:text-4xl font-bold wrap-break-word">
              {detail.name}
            </h1>
            {description && (
              <p className="text-muted-foreground text-sm lg:mt-2 max-w-2xl">
                {description}
              </p>
            )}
            <div className="lg:mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-medium">
                {detail.books_count} {detail.books_count === 1 ? "book" : "books"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {isAuthenticated && (
                <Button
                  variant={detail.is_following ? "outline" : "brand"}
                  size="sm"
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className="h-8 gap-1.5"
                >
                  {followLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : detail.is_following ? (
                    <>
                      <HeartOff className="h-3.5 w-3.5" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <Heart className="h-3.5 w-3.5" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <FollowDetailBookList books={detail.books || []} />
    </div>
  );
}
