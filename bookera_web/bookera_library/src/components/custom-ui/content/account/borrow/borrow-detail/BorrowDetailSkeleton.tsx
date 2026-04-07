import { Skeleton } from "@/components/ui/skeleton";

export function BorrowDetailSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72" />
        <Skeleton className="lg:col-span-2 h-72" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}
