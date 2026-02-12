import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryBubbleSkeleton() {
  return (
    <div className="relative space-y-3">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Skeleton for prev chevron button */}
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        
        {/* Skeleton for category grid */}
        <div className="flex-1">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-border aspect-[4/5]">
                <Skeleton className="h-14 w-14 md:h-16 md:w-16 rounded-full" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Skeleton for next chevron button */}
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      </div>
      
      {/* Skeleton for page indicator */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}
