"use client";

import { News } from "@/types/news";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, MessageCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { id, enUS } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { FadeUp } from "@/components/custom-ui/motion";

interface NewsCardProps {
  news: News;
  variant?: "default" | "compact";
}

export default function NewsCard({ news, variant = "default" }: NewsCardProps) {
  const t = useTranslations("news");
  const locale = useLocale();
  const dateLocale = locale === "id" ? id : enUS;

  const formattedDate = format(new Date(news.created_at), "dd MMM yyyy", {
    locale: dateLocale,
  });

  if (variant === "compact") {
    return (
      <FadeUp
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={`/news/${news.slug}`}>
          <Card className="overflow-hidden border-muted/60 hover:border-brand-primary/40 hover:shadow-md transition-all group bg-card/50 backdrop-blur-sm">
            <div className="flex gap-4 p-3">
              <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-muted/50">
                {news.image ? (
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-primary/5 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-brand-primary/20" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-brand-primary transition-colors">
                  {news.title}
                </h4>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {news.comments_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </FadeUp>
    );
  }

  return (
    <FadeUp>
      <Card className="overflow-hidden border-muted/60 hover:border-brand-primary/40 hover:shadow-xl transition-all group bg-card/50 backdrop-blur-sm h-full flex flex-col">
        <Link href={`/news/${news.slug}`} className="relative h-48 w-full overflow-hidden block">
          {news.image ? (
            <Image
              src={news.image}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-brand-primary/5 to-brand-primary/10 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-brand-primary/10" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg flex flex-col items-center min-w-[50px]">
              <span className="text-xs font-black text-brand-primary leading-none uppercase">
                {format(new Date(news.created_at), "MMM", { locale: dateLocale })}
              </span>
              <span className="text-lg font-black text-foreground leading-none mt-0.5">
                {format(new Date(news.created_at), "dd")}
              </span>
            </div>
          </div>
        </Link>

        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-4 mb-3 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-primary" />
              {news.admin?.profile?.full_name || "Admin"}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-brand-primary" />
              {news.comments_count || 0} {t("comments")}
            </span>
          </div>
          
          <Link href={`/news/${news.slug}`}>
            <h3 className="text-xl font-black mb-3 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
              {news.title}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4 flex-1">
            {news.content.replace(/<[^>]*>?/gm, "")}
          </p>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Link href={`/news/${news.slug}`} className="w-full">
            <Button variant="outline" className="w-full group/btn border-brand-primary/20 hover:border-brand-primary/50 hover:bg-brand-primary/5 text-brand-primary font-bold rounded-xl h-11 transition-all">
              {t("readMore")}
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </FadeUp>
  );
}
