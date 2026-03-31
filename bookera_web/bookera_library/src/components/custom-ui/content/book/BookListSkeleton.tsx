import { Skeleton } from "@/components/ui/skeleton";

export default function BookListSkeleton() {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-2 px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`border rounded-lg p-3 flex-col gap-2 ${
                i >= 2 ? "hidden sm:flex" : "flex"
              }`}
            >
              <div className="relative">
                <Skeleton className="aspect-3/4 w-full rounded" />
              </div>
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-4 w-12 rounded-sm" />
                <Skeleton className="h-4 w-16 rounded-sm" />
              </div>
              <div className="overflow-hidden">
                <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <div className="mt-auto">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-9 w-9 rounded-full hidden sm:block shadow-sm" />
    </div>
  );
}
