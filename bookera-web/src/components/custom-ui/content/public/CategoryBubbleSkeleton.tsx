import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryBubbleSkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-24 rounded-full" />
      ))}
    </div>
  );
}
