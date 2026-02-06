import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryBubbleSkeleton() {
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        {/* Skeleton for chevron buttons */}
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        
        {/* Skeleton for category grid */}
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-4" style={{ minHeight: '200px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
        
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      </div>
      
      {/* Skeleton for page indicator */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <Skeleton className="h-4 w-12 rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-2 w-2 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
