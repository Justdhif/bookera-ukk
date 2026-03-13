"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { userFollowerService } from "@/services/discussion.service";
import { DiscussionUser } from "@/types/discussion";
import { cn } from "@/lib/utils";

interface Props {
  user: DiscussionUser;
}

export default function DiscussionUserCard({ user }: Props) {
  const router = useRouter();
  const t = useTranslations("discussion");
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [following, setFollowing] = useState(user.is_following);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUser?.id === user.id;
  const name = user.profile?.full_name ?? user.email;
  const initial = name[0]?.toUpperCase() ?? "U";
  const avatarSrc = user.profile?.avatar_url ?? undefined;

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await userFollowerService.unfollow(user.id);
        setFollowing(false);
      } else {
        await userFollowerService.follow(user.id);
        setFollowing(true);
      }
    } catch {
      toast.error(following ? t("failedUnfollow") : t("failedFollow"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={`/discussion/user/${user.slug ?? user.id}`}
      className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:shadow-md hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all group w-36 shrink-0"
    >
      <div className="relative">
        <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-purple-400/50 transition-all">
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarFallback className="bg-linear-to-br from-pink-500 to-purple-600 text-white text-lg font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
        {user.role === "admin" && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">
            <Shield className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 text-center w-full min-w-0">
        <span className="text-sm font-semibold truncate max-w-full text-foreground">
          {name}
        </span>
        {user.role === "admin" && (
          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold border-0">
            Admin
          </Badge>
        )}
      </div>

      {!isOwner && (
        <Button
          size="sm"
          variant="brand"
          className={cn(
            "h-7 text-xs px-3 w-full rounded-full",
            following
              ? "border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          )}
          onClick={handleFollow}
          disabled={loading}
        >
          {following ? (
            <><UserCheck className="h-3 w-3 mr-1" />{t("following")}</>
          ) : (
            <><UserPlus className="h-3 w-3 mr-1" />{t("follow")}</>
          )}
        </Button>
      )}
    </Link>
  );
}
