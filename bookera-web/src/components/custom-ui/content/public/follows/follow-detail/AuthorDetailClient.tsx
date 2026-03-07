"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, User2, BookOpen, Heart, HeartOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { followService } from "@/services/follow.service";
import { AuthorDetail } from "@/types/follow";
import { useAuthStore } from "@/store/auth.store";
import FollowDetailBookList from "./FollowDetailBookList";

export default function AuthorDetailClient() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchAuthor = async () => {
    try {
      const res = await followService.getAuthorDetail(slug);
      setAuthor(res.data.data);
    } catch {
      toast.error("Failed to load author");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthor();
  }, [slug]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow authors");
      router.push("/login");
      return;
    }
    if (!author) return;
    setFollowLoading(true);
    try {
      if (author.is_following) {
        await followService.unfollow("author", author.id);
        toast.success(`Unfollowed ${author.name}`);
        setAuthor({ ...author, is_following: false });
        window.dispatchEvent(new Event("refreshFollowsList"));
        router.push("/");
      } else {
        await followService.follow("author", author.id);
        toast.success(`Now following ${author.name}`);
        setAuthor({ ...author, is_following: true });
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

  if (!author) return null;

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
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden shadow-lg ring-4 ring-border">
              {author.photo_url ? (
                <img
                  src={author.photo_url}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User2 className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end flex-1">
            <p className="text-muted-foreground text-sm">Author</p>
            <h1 className="lg:text-6xl sm:text-4xl font-bold wrap-break-word">
              {author.name}
            </h1>
            {author.bio && (
              <p className="text-muted-foreground text-sm lg:mt-2 max-w-2xl">
                {author.bio}
              </p>
            )}
            <div className="lg:mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-medium">
                {author.books_count} {author.books_count === 1 ? "book" : "books"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {isAuthenticated && (
                <Button
                  variant={author.is_following ? "outline" : "brand"}
                  size="sm"
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className="h-8 gap-1.5"
                >
                  {followLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : author.is_following ? (
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

      <FollowDetailBookList books={author.books || []} />
    </div>
  );
}
