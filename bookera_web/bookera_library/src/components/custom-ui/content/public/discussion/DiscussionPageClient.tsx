"use client";

import { useEffect, useState } from "react";
import { DiscussionPost } from "@/types/discussion";
import { publicService } from "@/services/public.service";
import DiscussionCard from "./DiscussionCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import { MessageSquare, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DiscussionPageClient() {
  const t = useTranslations("public");
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchDiscussions = async (pageToFetch: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await publicService.getDiscussions({ page: pageToFetch, per_page: 12 });
      const paginatedData = res.data.data;
      const { data, current_page, last_page } = paginatedData;

      if (isLoadMore) {
        setDiscussions(prev => [...prev, ...data]);
      } else {
        setDiscussions(data);
      }

      setHasMore(current_page < last_page);
      setPage(current_page);
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDiscussions(1);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchDiscussions(page + 1, true);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">
          {t("communityVoices") || "Community Voices"}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {t("communityVoicesDesc") || "Join the conversation and see what others are reading and thinking."}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <DataLoading variant="inline" size="lg" />
        </div>
      ) : discussions.length > 0 ? (
        <div className="space-y-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                className="h-full"
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <LoadMoreButton
                onClick={handleLoadMore}
                loading={loadingMore}
                variant="outline"
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No discussions yet"
          description="Be the first to start a discussion in our community!"
          icon={<MessageSquare />}
        />
      )}
    </div>
  );
}
