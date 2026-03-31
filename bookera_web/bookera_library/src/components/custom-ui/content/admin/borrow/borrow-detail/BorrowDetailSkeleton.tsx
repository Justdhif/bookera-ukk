import { Skeleton } from "@/components/ui/skeleton";

export function BorrowDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="lg:col-span-2 h-80" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
