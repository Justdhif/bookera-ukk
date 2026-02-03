import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoanMonthlyChartSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Skeleton className="w-1 h-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex items-end justify-between gap-2 h-[350px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <Skeleton 
                className="w-full rounded-t-md" 
                style={{ height: `${Math.random() * 60 + 20}%` }} 
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function LoanStatusChartSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Skeleton className="w-1 h-6 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex items-center justify-center h-[350px] gap-8">
          <Skeleton className="h-64 w-64 rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
