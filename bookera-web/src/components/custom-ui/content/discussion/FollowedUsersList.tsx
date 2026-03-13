"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { userFollowerService } from "@/services/discussion.service";
import { UserFollower, DiscussionUser } from "@/types/discussion";
import DiscussionUserCard from "./DiscussionUserCard";

interface FollowedUsersListProps {
  userSlug: string;
}

export default function FollowedUsersList({ userSlug }: FollowedUsersListProps) {
  const t = useTranslations("discussion");
  const [following, setFollowing] = React.useState<UserFollower[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userSlug) return;
    userFollowerService
      .getFollowing(userSlug, { per_page: 15, page: 1 })
      .then((res) => {
        setFollowing(res.data.data?.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userSlug]);

  if (!loading && following.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{t("followingSection")}</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card w-36 shrink-0"
              >
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-7 w-full rounded-full" />
              </div>
            ))
          : following.map(({ followable: followedUser }) => {
              if (!followedUser) return null;
              const discUser: DiscussionUser = {
                id: followedUser.id,
                email: followedUser.email,
                role: followedUser.role,
                is_following: true,
                profile: followedUser.profile
                  ? {
                      full_name: followedUser.profile.full_name,
                      avatar_url: followedUser.profile.avatar_url,
                    }
                  : undefined,
              };
              return <DiscussionUserCard key={followedUser.id} user={discUser} />;
            })}
      </div>
    </div>
  );
}
