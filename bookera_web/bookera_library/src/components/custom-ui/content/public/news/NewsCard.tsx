"use client";

import { News } from "@/types/news";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { id, enUS } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { FadeUp } from "@/components/custom-ui/motion";
import DetailButton from "@/components/custom-ui/button/DetailButton";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuthStore } from "@/store/auth.store";

interface NewsCardProps {
  news: News;
  variant?: "default" | "compact";
}

export default function NewsCard({ news, variant = "default" }: NewsCardProps) {
  const t = useTranslations("news");
  const locale = useLocale();
  const { user: currentUser } = useAuthStore();
  const dateLocale = locale === "id" ? id : enUS;

  const formattedDate = format(new Date(news.created_at), "dd MMM yyyy", {
    locale: dateLocale,
  });

  const authorName = news.admin?.profile?.full_name || "Admin";
  const authorAvatar = news.admin?.profile?.avatar;
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const isMe = currentUser?.id === news.admin?.id;
  const profileHref = isMe ? "/my-profile" : `/${news.admin?.slug}`;

  if (variant === "compact") {
    return (
      <FadeUp whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
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
      <Card className="overflow-hidden border-muted/60 h-full flex flex-col pt-0 gap-0">
        <div className="p-4 flex items-center gap-3 border-b border-muted/10">
          <Link href={profileHref}>
            <Avatar className="h-10 w-10 border-2 border-brand-primary/10 shadow-sm hover:scale-105 transition-transform">
              {authorAvatar && <AvatarImage src={authorAvatar} alt={authorName} />}
              <AvatarFallback className="bg-brand-primary/5 text-brand-primary font-black text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col min-w-0">
            <Link href={profileHref}>
              <span className="text-sm font-black text-foreground truncate hover:text-brand-primary transition-colors">
                {authorName}
              </span>
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Calendar className="w-3 h-3 text-brand-primary" />
              {formattedDate}
            </div>
          </div>
        </div>

        <Link
          href={`/news/${news.slug}`}
          className="relative aspect-square w-full overflow-hidden block"
        >
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
        </Link>

        <CardContent className="p-5 flex-1 flex flex-col gap-4">
          <Link href={`/news/${news.slug}`}>
            <h3 className="text-xl font-black line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
              {news.title}
            </h3>
          </Link>

          <div className="space-y-4 flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {news.content.replace(/<[^>]*>?/gm, "")}
            </p>

            <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mt-auto">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-brand-primary" />
                {news.comments_count || 0} {t("comments")}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Link href={`/news/${news.slug}`} className="w-full">
            <DetailButton
              className="w-full h-11 rounded-xl font-bold border-brand-primary/20 hover:border-brand-primary/50 hover:bg-brand-primary/5 text-brand-primary"
            />
          </Link>
        </CardFooter>
      </Card>
    </FadeUp>
  );
}
