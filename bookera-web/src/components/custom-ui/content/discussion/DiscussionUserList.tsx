"use client";

import { useEffect, useState } from "react";
import { Users2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { discussionPostService } from "@/services/discussion.service";
import { DiscussionUser } from "@/types/discussion";
import DiscussionUserCard from "./DiscussionUserCard";

export default function DiscussionUserList() {
  const t = useTranslations("discussion");
  const [users, setUsers] = useState<DiscussionUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    discussionPostService
      .getActiveUsers()
      .then((res) => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && users.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{t("activeUsers")}</h3>
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
          : users.map((u) => <DiscussionUserCard key={u.id} user={u} />)}
      </div>
    </div>
  );
}
