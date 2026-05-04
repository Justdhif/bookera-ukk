"use client";

import { News } from "@/types/news";
import NewsCard from "./NewsCard";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Newspaper } from "lucide-react";
import { useTranslations } from "next-intl";
import { StaggerContainer } from "@/components/custom-ui/motion";

interface NewsGridProps {
  newsList: News[];
  loading?: boolean;
}

export default function NewsGrid({ newsList, loading }: NewsGridProps) {
  const t = useTranslations("news");

  if (!loading && newsList.length === 0) {
    return (
      <EmptyState
        icon={<Newspaper className="w-16 h-16" />}
        title={t("newsNotFound")}
        description={t("description")}
      />
    );
  }

  return (
    <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {newsList.map((news, index) => (
        <NewsCard key={news.id} news={news} />
      ))}
    </StaggerContainer>
  );
}
