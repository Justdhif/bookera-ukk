"use client";

import { useTranslations } from "next-intl";
import { User } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare, UserPlus, Users, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

interface PublicUserCardProps {
  user: User;
  className?: string;
}

export default function PublicUserCard({ user, className }: PublicUserCardProps) {
  const t = useTranslations("explore");
  const { isAuthenticated } = useAuthStore();
  const profile = user.profile;
  const avatarUrl = profile?.avatar || "";
  const fullName = profile?.full_name || "User";
  const username = user.email.split("@")[0];

  return (
    <Card className={cn(
      "group overflow-hidden border-muted/50 bg-card/40 backdrop-blur-md transition-all hover:border-brand-primary/40 hover:bg-card hover:shadow-lg pt-0",
      className
    )}>
      <CardContent className="p-0">
        <div className="h-20 bg-linear-to-r from-brand-primary/20 to-brand-primary-light/10 group-hover:from-brand-primary/30 group-hover:to-brand-primary-light/20 transition-all" />
        
        <div className="px-5 pb-6">
          <div className="relative -mt-10 mb-3">
            <Link href={`/${user.slug}/profile`}>
              <Avatar className="h-20 w-20 border-4 border-background shadow-md group-hover:scale-105 transition-transform">
                <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xl font-bold">
                  {fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          <div className="space-y-1">
            <Link href={`/${user.slug}/profile`}>
              <h3 className="font-bold text-lg group-hover:text-brand-primary transition-colors truncate">
                {fullName}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              @{username}
            </p>
          </div>

          {profile?.bio && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
              {profile.bio}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="flex flex-col">
              <span className="text-sm font-bold flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-brand-primary/60" />
                {user.discussion_posts_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("post")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-500/60" />
                {user.complaints_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("report")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500/60" />
                {user.followers_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("follower")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold flex items-center gap-1">
                <Users className="h-3 w-3 text-purple-500/60" />
                {user.following_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("following")}</span>
            </div>
          </div>

          {isAuthenticated && (
            <div className="mt-6 flex gap-2">
              <Button size="sm" className="rounded-xl gap-2 font-bold bg-brand-primary hover:bg-brand-primary/90 text-white">
                <UserPlus className="h-4 w-4" />
                {t("follow")}
              </Button>
              <Button size="icon" variant="outline" className="shrink-0 rounded-xl border-muted/50 hover:bg-muted/50 transition-colors">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
