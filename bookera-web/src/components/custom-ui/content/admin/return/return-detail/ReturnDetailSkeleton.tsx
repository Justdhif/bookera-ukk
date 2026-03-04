import { Skeleton } from "@/components/ui/skeleton";

export function ReturnDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-56" />
      <Skeleton className="h-48" />
    </div>
  );
}
