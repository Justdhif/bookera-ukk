"use client";

import { useState, useEffect } from "react";
import { newsService } from "@/services/news.service";
import { News } from "@/types/news";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useTranslations } from "next-intl";
import NewsGrid from "./NewsGrid";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import { useDebounce } from "@/hooks/useDebounce";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function NewsListClient() {
  const t = useTranslations("news");
  const tc = useTranslations("common");

  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const fetchNews = async (pageNum = 1, isSearch = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await newsService.getAllNews({
        page: pageNum,
        search: debouncedSearch,
        per_page: 12,
      });
      const data = res.data.data;

      if (pageNum === 1) {
        setNewsList(data.data);
      } else {
        setNewsList((prev) => [...prev, ...data.data]);
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
    fetchNews(1, true);
  }, [debouncedSearch]);

  return (
    <StaggerContainer className="space-y-8">
      <FadeUp>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <ContentHeader
            title={t("title")}
            description={t("description")}
            className="md:mb-0"
          />

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors z-10" />
            <Input
              placeholder={t("newsSearchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-2xl bg-card/50 backdrop-blur-sm border-muted/60 focus:ring-brand-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </FadeUp>

      {loading ? (
        <DataLoading size="lg" />
      ) : (
        <FadeUp delay={0.1}>
          <NewsGrid newsList={newsList} loading={loading} />

          {page < totalPages && (
            <div className="flex justify-center mt-12">
              <LoadMoreButton
                variant="outline"
                onClick={() => fetchNews(page + 1)}
                loading={loadingMore}
              />
            </div>
          )}
        </FadeUp>
      )}
    </StaggerContainer>
  );
}
