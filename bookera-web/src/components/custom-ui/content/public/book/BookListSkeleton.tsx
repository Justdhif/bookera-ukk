import { Skeleton } from "@/components/ui/skeleton";

export default function BookListSkeleton() {
  return (
    <div className="relative flex items-center gap-2">
      <Skeleton className="shrink-0 h-9 w-9 rounded-full" />
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`space-y-2 ${i >= 2 ? "hidden sm:block" : ""}`}>
            <Skeleton className="aspect-3/4 rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      <Skeleton className="shrink-0 h-9 w-9 rounded-full" />
    </div>
  );
}
