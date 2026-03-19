"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2, Search, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { discussionPostService } from "@/services/discussion.service";
import { useAuthStore } from "@/store/auth.store";
import { DiscussionPost } from "@/types/discussion";

const PER_PAGE = 12;

function getInitials(name?: string | null) {
  return name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";
}

function matchesQuery(post: DiscussionPost, rawQuery: string) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const caption = (post.caption ?? "").toLowerCase();
  const name = (post.user?.profile?.full_name ?? "").toLowerCase();
  const email = (post.user?.email ?? "").toLowerCase();
  return caption.includes(q) || name.includes(q) || email.includes(q);
}

function ExploreGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function DiscussionExplorePageClient() {
  const router = useRouter();
  const t = useTranslations("discussion");
  const locale = useLocale();
  const { isAuthenticated, initialLoading } = useAuthStore();

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // When searching, we progressively fetch *source* pages until we have enough matches.
  const [sourcePage, setSourcePage] = useState(1);
  const [sourceLastPage, setSourceLastPage] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const postsRef = useRef<DiscussionPost[]>([]);
  const sourcePageRef = useRef(1);
  const sourceLastPageRef = useRef(1);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    sourcePageRef.current = sourcePage;
  }, [sourcePage]);

  useEffect(() => {
    sourceLastPageRef.current = sourceLastPage;
  }, [sourceLastPage]);

  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, initialLoading, router]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const dateFnsLocale = useMemo(() => {
    return locale === "id" ? idLocale : enUS;
  }, [locale]);

  const fetchBrowsePage = useCallback(
    async (pageNum: number, append = false) => {
      const currentRequestId = ++requestIdRef.current;
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const res = await discussionPostService.getAll({
          page: pageNum,
          per_page: PER_PAGE,
        });
        const paginated = res.data.data;

        if (requestIdRef.current !== currentRequestId) return;

        setPosts((prev) =>
          append ? [...prev, ...(paginated.data ?? [])] : paginated.data ?? [],
        );
        setLastPage(paginated.last_page ?? 1);
      } catch {
        toast.error(t("failedLoadPosts"));
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [t],
  );

  const fetchSearchUntil = useCallback(
    async (targetCount: number, startFromPage: number, append: boolean) => {
      const currentRequestId = ++requestIdRef.current;
      const q = debouncedQuery.trim();

      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        let nextPage = startFromPage;
        let last = sourceLastPageRef.current;
        let results: DiscussionPost[] = append ? [...postsRef.current] : [];

        while (results.length < targetCount) {
          const res = await discussionPostService.getAll({
            page: nextPage,
            per_page: PER_PAGE,
          });

          if (requestIdRef.current !== currentRequestId) return;

          const paginated = res.data.data;
          const pageItems = paginated.data ?? [];
          last = paginated.last_page ?? 1;

          const matched = pageItems.filter((p) => matchesQuery(p, q));
          results = [...results, ...matched];

          setSourceLastPage(last);
          setSourcePage(nextPage);

          if (nextPage >= last) break;
          nextPage += 1;
        }

        setPosts(results);
      } catch {
        toast.error(t("failedLoadPosts"));
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedQuery, t],
  );

  // Initial load / when query changes
  useEffect(() => {
    const q = debouncedQuery.trim();

    // reset state
    setPosts([]);
    setPage(1);
    setLastPage(1);
    setSourcePage(1);
    setSourceLastPage(1);

    if (!q) {
      fetchBrowsePage(1, false);
      return;
    }

    fetchSearchUntil(PER_PAGE, 1, false);
  }, [debouncedQuery, fetchBrowsePage, fetchSearchUntil]);

  const handleLoadMore = () => {
    const q = debouncedQuery.trim();
    if (!q) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBrowsePage(nextPage, true);
      return;
    }

    const target = posts.length + PER_PAGE;
    const nextSourcePage = sourcePage + 1;
    fetchSearchUntil(target, nextSourcePage, true);
  };

  const showLoadMore = debouncedQuery.trim()
    ? sourcePage < sourceLastPage
    : page < lastPage;

  if (initialLoading || loading) {
    return <ExploreGridSkeleton />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("exploreSearchPlaceholder")}
          className="pl-9 rounded-xl"
        />
      </div>

      {posts.length === 0 ? (
        <EmptyState icon={<ImageOff />} description={t("noPosts")} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {posts.map((post) => {
              const first = post.images?.[0];
              const href = `/discussion/${post.slug}`;


              const displayName =
                post.user?.profile?.full_name || post.user?.email || "User";

              return (
                <Link
                  key={post.id}
                  href={href}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted"
                  aria-label={post.caption ?? post.slug}
                >
                  {first?.image_path ? (
                    <Image
                      src={first.image_path}
                      alt={post.caption ?? "Post"}
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/70 via-black/25 to-transparent">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 ring-1 ring-white/25">
                        <AvatarImage src={post.user?.profile?.avatar} alt={displayName} />
                        <AvatarFallback className="text-[10px] font-semibold">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-white/80 truncate">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: dateFnsLocale,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {showLoadMore && (
            <div className="flex justify-center pt-2">
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
        </>
      )}
    </div>
  );
}
