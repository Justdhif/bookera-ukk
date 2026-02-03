import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityStatisticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="group relative overflow-hidden border-none transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full transition-opacity" />
          <div className="absolute top-3 right-3">
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex items-center gap-1.5 mt-1">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="pt-3 border-t border-border/40">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
