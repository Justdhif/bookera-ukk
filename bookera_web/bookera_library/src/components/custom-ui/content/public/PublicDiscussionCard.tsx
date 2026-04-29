"use client";

import { DiscussionPost } from "@/types/discussion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";

interface DiscussionCardProps {
  discussion: DiscussionPost;
  className?: string;
}

export default function PublicDiscussionCard({ discussion, className }: DiscussionCardProps) {
  const profile = discussion.user?.profile;
  const avatarUrl = profile?.avatar || "";
  const images = discussion.images || [];
  const hasImages = images.length > 0;

  return (
    <Card className={cn(
      "group overflow-hidden border-muted/50 bg-card/40 backdrop-blur-md transition-all hover:border-brand-primary/40 hover:bg-card hover:shadow-lg hover:shadow-brand-primary/5",
      className
    )}>
      <CardContent className="px-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/${discussion.user?.slug}/profile`} onClick={(e) => e.stopPropagation()}>
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-brand-primary/20 transition-colors">
                <AvatarImage src={avatarUrl} alt={profile?.full_name || "User"} className="object-cover" />
                <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs font-bold">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-bold leading-none truncate group-hover:text-brand-primary transition-colors block">
                    {profile?.full_name || "Anonymous"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {discussion.user?.role === "admin" && <AdminBadge className="h-3.5 px-1 text-[7px]" />}
                    {discussion.user?.profile?.gender === "croissant" && <CroissantBadge className="h-3.5 px-1 text-[7px]" />}
                  </div>
                </div>
              <span className="text-[11px] text-muted-foreground truncate">
                @{discussion.user?.email.split("@")[0]}
              </span>
            </div>
          </div>
        </div>

        <Link href={`/discussions/${discussion.slug}`} className="block">
          <div className="relative">
            <span className="absolute -top-2 -left-1 text-3xl text-brand-primary/10 font-serif leading-none">"</span>
            <p className="text-sm line-clamp-3 min-h-[60px] text-foreground/90 leading-relaxed pl-2">
              {discussion.caption}
            </p>
          </div>

          {hasImages && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-muted/30 bg-muted/20 mt-4">
              <img
                src={images[0].image_path}
                alt="Discussion content"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {images.length > 1 && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                  <ImageIcon className="h-3 w-3" />
                  <span>+{images.length - 1}</span>
                </div>
              )}
            </div>
          )}
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-muted/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-rose-500 cursor-pointer">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>{discussion.likes_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-brand-primary cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              <span>{discussion.comments_count}</span>
            </div>
          </div>
          
          <div className="text-[10px] text-muted-foreground font-medium">
            {new Date(discussion.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
