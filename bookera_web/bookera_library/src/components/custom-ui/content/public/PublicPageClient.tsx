"use client";

import BannerCarousel from "./BannerCarousel";
import DailyTimeline from "./DailyTimeline";
import PublicBookGrid from "@/components/custom-ui/content/public/PublicBookGrid";

export default function PublicPageClient() {
  return (
    <div className="space-y-8 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3">
          <BannerCarousel />
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-6">
        <DailyTimeline />
        <div className="space-y-10">
          <PublicBookGrid showBorrowActions={false} />
        </div>
      </div>
    </div>
  );
}
