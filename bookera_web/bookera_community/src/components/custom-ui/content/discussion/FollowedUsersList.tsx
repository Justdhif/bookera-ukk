"use client";

import * as React from "react";
import { Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DiscussionUser } from "@/types/discussion";
import DiscussionUserCard from "./DiscussionUserCard";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FollowedUsersListProps {
  users: DiscussionUser[];
}

export default function FollowedUsersList({ users }: FollowedUsersListProps) {
  const t = useTranslations("discussion");
  const followedUsers = users;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{t("followingSection")}</h3>
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {followedUsers.length === 0 ? (
          <EmptyState
            title={t("emptyStateFollowingTitle")}
            description={t("emptyStateFollowingDesc")}
            icon={<Users />}
            variant="compact"
            className="border border-dashed h-48 py-4 px-4 bg-muted/40"
          />
        ) : (
          <>
            {/* Mobile: avatar-only horizontal scroll */}
            <div className="scrollbar-hide flex items-center gap-3 overflow-x-auto pb-2 md:hidden">
              {followedUsers.map((followedUser) => {
                const name = followedUser.profile?.full_name ?? followedUser.email;
                const initial = name[0]?.toUpperCase() ?? "U";
                const href = `/discussion/user/${followedUser.slug ?? followedUser.id}`;
                return (
                  <Link
                    key={followedUser.id}
                    href={href}
                    className="shrink-0"
                    aria-label={name}
                    title={name}
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage src={followedUser.profile?.avatar} alt={name} />
                      <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                );
              })}
            </div>

            {/* Desktop: full-width rows */}
            <div className="hidden md:flex md:flex-col gap-3">
              {followedUsers.map((followedUser) => {
                return (
                  <DiscussionUserCard
                    key={followedUser.id}
                    user={followedUser}
                    variant="row"
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
