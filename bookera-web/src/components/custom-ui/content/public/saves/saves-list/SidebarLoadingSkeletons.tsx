import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeletons untuk sidebar mode */
export default function SidebarLoadingSkeletons() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-3 p-2.5 rounded-xl bg-muted/50 dark:bg-white/8"
        >
          <Skeleton className="w-12 h-16 rounded-lg shrink-0 bg-muted/80 dark:bg-white/20" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-3 w-3/4 bg-muted/80 dark:bg-white/20" />
            <Skeleton className="h-2.5 w-1/3 bg-muted/60 dark:bg-white/15" />
          </div>
        </div>
      ))}
    </>
  );
}
