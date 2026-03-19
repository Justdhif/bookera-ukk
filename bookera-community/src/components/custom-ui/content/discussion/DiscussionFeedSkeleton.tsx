"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FollowedUsersListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {/* Mobile: avatar-only skeleton */}
        <div className="scrollbar-hide flex items-center gap-3 overflow-x-auto pb-2 md:hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-12 rounded-full shrink-0" />
          ))}
        </div>

        {/* Desktop: row skeleton */}
        <div className="hidden md:flex md:flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card w-full"
            >
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiscussionFeedSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6 md:items-start">
        <div className="order-2 w-full md:order-1 md:flex-1 md:min-w-0 md:max-w-2xl space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-80 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
