import { Skeleton } from "@/components/ui/skeleton";

export function TermsOfServiceTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border-l-4 border-brand-primary/30 pl-4 py-4 bg-card rounded-lg border border-border"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-64" />
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              <div className="flex items-center gap-4 pt-2 border-t">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
