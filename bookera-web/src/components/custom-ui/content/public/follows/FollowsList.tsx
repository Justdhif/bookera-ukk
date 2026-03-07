"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { followService } from "@/services/follow.service";
import { FollowedAuthor, FollowedPublisher } from "@/types/follow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Users } from "lucide-react";
import SidebarFollowItem, {
  CollapsedFollowItem,
} from "./SidebarFollowItem";

interface FollowsListProps {
  isCollapsed?: boolean;
}

export default function FollowsList({ isCollapsed = false }: FollowsListProps) {
  const t = useTranslations("public");
  const { isAuthenticated } = useAuthStore();
  const [authors, setAuthors] = useState<FollowedAuthor[]>([]);
  const [publishers, setPublishers] = useState<FollowedPublisher[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFollows = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [authorsRes, publishersRes] = await Promise.all([
        followService.getFollowedAuthors(),
        followService.getFollowedPublishers(),
      ]);
      setAuthors(authorsRes.data.data);
      setPublishers(publishersRes.data.data);
    } catch (error) {
      console.error("Failed to fetch follows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollows();
    const handleRefresh = () => fetchFollows();
    window.addEventListener("refreshFollowsList", handleRefresh);
    return () =>
      window.removeEventListener("refreshFollowsList", handleRefresh);
  }, [isAuthenticated]);

  const allItems = [
    ...authors.map((a) => ({ ...a, type: "author" as const })),
    ...publishers.map((p) => ({ ...p, type: "publisher" as const })),
  ];

  if (!isAuthenticated || allItems.length === 0) return null;

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="flex flex-col items-center gap-2 py-2">
          {loading ? (
            <>
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </>
          ) : (
            allItems.slice(0, 5).map((item) => (
              <CollapsedFollowItem key={`${item.type}-${item.id}`} item={item} type={item.type} />
            ))
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-primary/10 dark:bg-brand-primary/20">
          <Users className="h-3.5 w-3.5 text-brand-primary dark:text-brand-primary-light" />
        </div>
        <h3 className="text-xs font-semibold text-foreground dark:text-white">
          {t("following")}
        </h3>
      </div>

      <div className="px-3 pb-3">
        {loading ? (
          <div className="space-y-1.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-3 p-2.5 rounded-xl bg-muted/50 dark:bg-white/8"
              >
                <Skeleton className="w-12 h-12 rounded-full shrink-0 bg-muted/80 dark:bg-white/20" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3 w-3/4 bg-muted/80 dark:bg-white/20" />
                  <Skeleton className="h-2.5 w-1/3 bg-muted/60 dark:bg-white/15" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {allItems.map((item) => (
              <SidebarFollowItem
                key={`${item.type}-${item.id}`}
                item={item}
                type={item.type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
