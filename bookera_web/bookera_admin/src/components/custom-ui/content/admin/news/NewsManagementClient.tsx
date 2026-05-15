"use client";

import { useState, useEffect } from "react";
import { newsService } from "@/services/news.service";
import { News } from "@/types/news";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useTranslations } from "next-intl";
import NewsTable from "./NewsTable";
import NewsFormSheet from "./NewsFormSheet";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import PaginatedContent from "@/components/custom-ui/PaginatedContent";
import { StaggerContainer, FadeUp, FadeIn } from "@/components/custom-ui/motion";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import RefreshButton from "@/components/custom-ui/button/RefreshButton";

export default function NewsManagementClient() {
  const t = useTranslations("news");
  const tc = useTranslations("common");
  
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    from: 0,
    to: 0,
    last_page: 1,
    current_page: 1
  });
  const debouncedSearch = useDebounce(search, 500);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchNews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await newsService.getAllNews({
        page: pageNum,
        search: debouncedSearch,
        per_page: 10
      });
      const data = res.data.data;
      setNewsList(data.data);
      setPagination({
        total: data.total,
        from: data.from,
        to: data.to,
        last_page: data.last_page,
        current_page: pageNum
      });
    } catch (error) {
      console.error(error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(1);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await newsService.adminDeleteNews(deleteId);
      toast.success(t("newsDeleted"));
      setDeleteId(null);
      fetchNews(pagination.current_page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("somethingWentWrong"));
    }
  };


  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("newsManagement")}
          description={t("newsManagementDesc")}
          isAdmin
          rightActions={
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={() => fetchNews(pagination.current_page)}
                loading={loading}
              />
              <Button
                onClick={() => {
                  setSelectedNews(null);
                  setIsSheetOpen(true);
                }}
                variant="submit"
                className="h-8 gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("addNews")}
              </Button>
            </div>
          }
        />
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-2 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
            <Input
              placeholder={t("newsSearchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
            />
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <PaginatedContent
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={fetchNews}
        >
          {loading ? (
            <FadeIn key="loading">
              <DataLoading size="lg" />
            </FadeIn>
          ) : (
            <FadeIn key="content">
              <NewsTable
              data={newsList}
              onEdit={(news) => {
                setSelectedNews(news);
                setIsSheetOpen(true);
              }}
              onDelete={(id) => setDeleteId(id)}
            />
            </FadeIn>
          )}
        </PaginatedContent>
      </FadeUp>

      <NewsFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        initialData={selectedNews}
        onSuccess={() => {
          fetchNews(pagination.current_page);
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("deleteNews") || tc("deleteData")}
        description={t("deleteNewsConfirm")}
        onConfirm={handleDelete}
      />
    </StaggerContainer>
  );
}
