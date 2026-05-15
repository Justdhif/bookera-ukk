"use client";

import { useState, useEffect } from "react";
import { newsService } from "@/services/news.service";
import { News } from "@/types/news";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import {
  Calendar,
  User as UserIcon,
  MessageCircle,
  Share2,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import CommentSection from "@/components/custom-ui/CommentSection";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function NewsDetailClient() {
  const t = useTranslations("news");
  const params = useParams();
  const slug = params.slug as string;
  const locale = useLocale();
  const dateLocale = locale === "id" ? id : enUS;

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  const fetchNewsDetail = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await newsService.getNewsBySlug(slug);
      const data = res.data.data;
      setNews(data);
      setCommentCount(data.comments_count || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsDetail();
  }, [slug]);

  const formattedDate = news
    ? format(new Date(news.created_at), "eeee, dd MMMM yyyy", {
        locale: dateLocale,
      })
    : "";

  return (
    <StaggerContainer className="space-y-8">
      <FadeUp>
        <ContentHeader
          title={t("title")}
          description={t("description")}
          showBackButton
          isAdmin
        />
      </FadeUp>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <DataLoading size="lg" variant="inline" />
        </div>
      ) : !news ? (
        <EmptyState
          icon={<AlertTriangle className="w-16 h-16" />}
          title={t("newsNotFound")}
          description={t("description")}
        />
      ) : (
        <>
          <FadeUp delay={0.08}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-8 lg:sticky lg:top-4">
                <Card className="overflow-hidden border-2 border-muted/50 bg-card/40 backdrop-blur-md shadow-xl rounded-3xl p-0">
                  <CardHeader className="p-8 pb-4 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                          <AvatarImage
                            src={news.admin?.profile?.avatar || ""}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-brand-primary/5 text-brand-primary font-black">
                            {(news.admin?.profile?.full_name ||
                              news.admin?.email ||
                              "A")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-black truncate leading-tight">
                              {news.admin?.profile?.full_name ||
                                news.admin?.email ||
                                "Admin"}
                            </p>
                            <AdminBadge />
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                            {formattedDate} •{" "}
                            {format(new Date(news.created_at), "HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-muted-foreground self-end sm:self-auto">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-brand-primary/60" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">
                            {commentCount} {t("comments")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h1 className="text-4xl font-black tracking-tight leading-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                        {news.title}
                      </h1>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 pt-4 space-y-8">
                    {news.image && (
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-muted/20 shadow-lg">
                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          className="object-cover"
                          priority
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div
                        className="text-base leading-relaxed text-foreground/80 whitespace-pre-line font-medium"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                      />
                    </div>

                    <div className="pt-6 mt-6 border-t border-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-primary" />
                        <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          {t("publishedAt", { date: formattedDate })}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 rounded-xl font-bold text-brand-primary hover:bg-brand-primary/10"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {t("share")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6 lg:sticky lg:top-4">
                <CommentSection
                  entitySlug={news.slug}
                  commentCount={commentCount}
                  onCommentCountChange={setCommentCount}
                  namespace="news"
                  getComments={(slug, params) =>
                    newsService.getNewsComments(news.id, params)
                  }
                  createComment={(slug, data) =>
                    newsService.createComment(news.id, data)
                  }
                  deleteComment={(id) => newsService.deleteComment(id)}
                />
              </div>
            </div>
          </FadeUp>
        </>
      )}
    </StaggerContainer>
  );
}
