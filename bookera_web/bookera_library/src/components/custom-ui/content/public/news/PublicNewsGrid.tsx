"use client";

import { useState, useEffect } from "react";
import { newsService } from "@/services/news.service";
import { News } from "@/types/news";
import NewsGrid from "./NewsGrid";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import { useTranslations } from "next-intl";

interface PublicNewsGridProps {
  limit?: number;
  excludeId?: number;
  showPagination?: boolean;
}

export default function PublicNewsGrid({
  limit = 12,
  excludeId,
  showPagination = true,
}: PublicNewsGridProps) {
  const t = useTranslations("news");
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await newsService.getAllNews({
        page: pageNum,
        per_page: limit,
      });
      const data = res.data.data;

      let filteredData = data.data;
      if (excludeId) {
        filteredData = filteredData.filter((n: News) => n.id !== excludeId);
      }

      if (pageNum === 1) {
        setNewsList(filteredData);
      } else {
        setNewsList((prev) => [...prev, ...filteredData]);
      }

      setTotalPages(data.last_page);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews(1);
  }, [excludeId]);

  if (loading) {
    return <DataLoading size="lg" />;
  }

  return (
    <div className="space-y-12">
      <NewsGrid newsList={newsList} loading={loading} />

      {showPagination && page < totalPages && (
        <div className="flex justify-center">
          <LoadMoreButton
            variant="outline"
            onClick={() => fetchNews(page + 1)}
            loading={loadingMore}
          />
        </div>
      )}
    </div>
  );
}
