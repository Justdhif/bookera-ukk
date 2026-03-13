"use client";

import { useTranslations } from "next-intl";
import { UserPlus, UserCheck, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { FollowCounts } from "@/types/discussion";

function getInitials(name?: string | null) {
  return name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";
}

interface Props {
  profile: User;
  followCounts: FollowCounts | null;
  following: boolean;
  followLoading: boolean;
  isOwnProfile: boolean;
  onFollow: () => void;
}

export function UserDiscussionProfileHeader({
  profile,
  followCounts,
  following,
  followLoading,
  isOwnProfile,
  onFollow,
}: Props) {
  const t = useTranslations("discussion");

  const avatarSrc = profile.profile?.avatar_url || profile.profile?.avatar || undefined;
  const name = profile.profile?.full_name ?? profile.email;

  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 opacity-70" />
      <div className="px-6 pb-6 -mt-10">
        <div className="flex items-end justify-between gap-4 mb-4">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          {!isOwnProfile && (
            <Button
              variant="brand"
              size="sm"
              className={cn(
                "rounded-full gap-1.5",
                following
                  ? "border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  : "bg-purple-600 hover:bg-purple-700 text-white",
              )}
              onClick={onFollow}
              disabled={followLoading}
            >
              {following ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  {t("following")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {t("follow")}
                </>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{name}</h1>
            {profile.role === "admin" && (
              <Badge className="text-[10px] px-1.5 py-0 h-5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold border-0">
                <Shield className="h-3 w-3 mr-0.5" />
                {t("adminBadge")}
              </Badge>
            )}
          </div>

          {profile.profile?.bio && (
            <p className="text-sm text-muted-foreground">{profile.profile.bio}</p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-semibold">{followCounts?.followers_count ?? 0}</span>
              <span className="text-muted-foreground">{t("followers")}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="font-semibold">{followCounts?.following_count ?? 0}</span>
              <span className="text-muted-foreground">{t("followingLabel")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
