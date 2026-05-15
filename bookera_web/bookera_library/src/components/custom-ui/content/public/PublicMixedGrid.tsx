"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { newsService } from "@/services/news.service";
import { publicService } from "@/services/public.service";
import { News } from "@/types/news";
import { Book } from "@/types/book";
import NewsCard from "./news/NewsCard";
import BookCard from "./book-detail/BookCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/button/LoadMoreButton";
import { FadeUp, StaggerContainer } from "@/components/custom-ui/motion";
import { Newspaper, Sparkles } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { cn } from "@/lib/utils";

export default function PublicMixedGrid() {
  const t = useTranslations("news");
  const tPublic = useTranslations("public");
  
  const [newsList, setNewsList] = useState<News[]>([]);
  const [booksPool, setBooksPool] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newsPage, setNewsPage] = useState(1);
  const [booksPage, setBooksPage] = useState(1);
  const [totalNewsPages, setTotalNewsPages] = useState(1);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch 10 news (Page 1)
      const newsRes = await newsService.getAllNews({ page: 1, per_page: 10 });
      setNewsList(newsRes.data.data.data);
      setTotalNewsPages(newsRes.data.data.last_page);

      // Fetch 25 books (5 rows * 5 books per row = 25 books for 10 news)
      const booksRes = await publicService.getBooks({ page: 1, per_page: 25, status: "active" });
      setBooksPool(booksRes.data.data.data);
      setBooksPage(2); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = async () => {
    setLoadingMore(true);
    const nextNewsPage = newsPage + 1;
    try {
      const newsRes = await newsService.getAllNews({ page: nextNewsPage, per_page: 10 });
      setNewsList(prev => [...prev, ...newsRes.data.data.data]);
      setNewsPage(nextNewsPage);

      // Fetch 25 more unique books
      const booksRes = await publicService.getBooks({ page: booksPage, per_page: 25, status: "active" });
      setBooksPool(prev => [...prev, ...booksRes.data.data.data]);
      setBooksPage(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  if (loading) return <DataLoading size="lg" />;

  if (newsList.length === 0) {
    return (
      <EmptyState
        icon={<Newspaper className="w-16 h-16" />}
        title={t("newsNotFound")}
        description={t("description")}
      />
    );
  }

  const renderContent = () => {
    const items = [];
    for (let i = 0; i < newsList.length; i += 2) {
      // Add 2 news cards
      const newsPair = newsList.slice(i, i + 2);
      items.push(
        <div key={`news-row-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {newsPair.map(news => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      );

      const rowIndex = i / 2;
      const rowBooks = booksPool.slice(rowIndex * 5, (rowIndex + 1) * 5);
      
      if (rowBooks.length > 0) {
        items.push(
          <div key={`book-row-${rowIndex}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-12">
            {rowBooks.map(book => (
              <BookCard key={book.id} book={book} size="md" />
            ))}
          </div>
        );
      }
    }
    return items;
  };

  return (
    <div className="space-y-4">
      <StaggerContainer staggerDelay={0.1}>
        {renderContent()}
      </StaggerContainer>
      
      {newsPage < totalNewsPages && (
        <div className="flex justify-center pt-12 pb-6">
          <LoadMoreButton
            onClick={fetchMoreData}
            loading={loadingMore}
            variant="outline"
            className="px-10 h-12 rounded-full font-bold border-brand-primary/20 hover:border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-all"
          />
        </div>
      )}
    </div>
  );
}
