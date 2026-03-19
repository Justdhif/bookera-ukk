"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentLoadingScreen() {
  const t = useTranslations('common');
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-5">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-7 w-40 rounded" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('loading')}</span>
          <Skeleton className="h-2 w-64 rounded-full" />
        </div>
      </div>
    </div>
  );
}
