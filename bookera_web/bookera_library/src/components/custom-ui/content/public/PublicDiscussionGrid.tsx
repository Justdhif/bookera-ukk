"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Search, Plus } from "lucide-react";
import { DiscussionPost } from "@/types/discussion";
import { publicService } from "@/services/public.service";
import PublicDiscussionCard from "./PublicDiscussionCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";
import DiscussionFormSheet from "./discussions/DiscussionFormSheet";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";

interface PublicDiscussionGridProps {
  search?: string;
}

export default function PublicDiscussionGrid({
  search,
}: PublicDiscussionGridProps) {
  const t = useTranslations("public");
  const tDiscussion = useTranslations("discussion");
  const tExplore = useTranslations("explore");
  const { isAuthenticated } = useAuthStore();
  
  const requestIdRef = useRef(0);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("recent");
  const [total, setTotal] = useState(0);

  const resetPagination = () => {
    setDiscussions([]);
    setPage(1);
    setTotalPages(1);
    setLoading(true);
  };

  useEffect(() => {
    resetPagination();
  }, [search, filter]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let active = true;
    const isLoadMore = page > 1;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const fetchDiscussions = async () => {
      try {
        let nextData: DiscussionPost[] = [];
        let fetchedLastPage = 1;
        let fetchedTotal = 0;

        if (filter === "top") {
            const res = await publicService.getTopDiscussions();
            if (!active || requestIdRef.current !== requestId) return;
            nextData = res.data.data;
            fetchedLastPage = 1;
            fetchedTotal = nextData.length;
        } else {
            const res = await publicService.getDiscussions({
                page,
                per_page: 12,
                search,
            });
            if (!active || requestIdRef.current !== requestId) return;
            nextData = res.data.data.data;
            fetchedLastPage = res.data.data.last_page;
            fetchedTotal = res.data.data.total;
        }

        setDiscussions((prev) => (isLoadMore ? [...prev, ...nextData] : nextData));
        setTotalPages(fetchedLastPage);
        setTotal(fetchedTotal);
      } catch (error) {
        if (active && requestIdRef.current === requestId) {
          console.error(error);
        }
      } finally {
        if (active && requestIdRef.current === requestId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchDiscussions();

    return () => {
      active = false;
    };
  }, [page, search, filter]);

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    setPage((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">{t("whatDoTheySay")}</h2>
              <p className="text-sm text-muted-foreground">
                  {total} {t("discussions")} 
              </p>
          </div>

          {isAuthenticated && (
              <div className="flex items-center gap-4 px-4 py-2 bg-muted/40 rounded-full border border-border/50 shadow-sm backdrop-blur-sm shrink-0 w-fit self-end sm:self-auto">
                  <p className="hidden md:block text-xs font-medium text-muted-foreground">
                      {tDiscussion("shareSomething")}
                  </p>
                  <div className="hidden md:block w-px h-5 bg-border/80"></div>
                  <DiscussionFormSheet 
                      onSuccess={resetPagination}
                      trigger={
                          <Button 
                              variant="submit"
                              size="sm"
                              className="h-8 gap-2 rounded-full px-5 shadow-xs transition-all hover:scale-[1.02]"
                          >
                              <Plus className="h-3.5 w-3.5" />
                              {tDiscussion("addTitle")}
                          </Button>
                      }
                  />
              </div>
          )}
      </div>

      {loading && discussions.length === 0 ? (
        <DataLoading />
      ) : discussions.length === 0 ? (
        <EmptyState
          icon={<MessageSquare />}
          title={search ? tExplore("noDiscussionsFound") : tExplore("discussionsSubtitle")}
          description={search ? tExplore("noDiscussionsDesc") : tExplore("firstDiscussion")}
          variant="compact"
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {discussions.map((discussion) => (
              <PublicDiscussionCard
                key={discussion.id}
                discussion={discussion}
              />
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <LoadMoreButton
                onClick={handleLoadMore}
                loading={loadingMore}
                variant="outline"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
