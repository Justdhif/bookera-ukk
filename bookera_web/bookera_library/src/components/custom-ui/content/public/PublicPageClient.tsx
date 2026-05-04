"use client";

import BannerCarousel from "./BannerCarousel";
import DailyTimeline from "./DailyTimeline";
import PublicBookGrid from "@/components/custom-ui/content/public/PublicBookGrid";
import DiscussionMarquee from "./DiscussionMarquee";
import { Heart, BookOpen, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";

export default function PublicPageClient() {
  const t = useTranslations("navbar");
  const user = useAuthStore((state) => state.user);
  const canUseFavoriteAction = Boolean(user && user.role !== "user");
  const favoriteHref = "/favorites";
  const myBorrowsHref = user ? "/my-borrows" : "/login?redirect=/my-borrows";
  const myFinesHref = user ? "/my-fines" : "/login?redirect=/my-fines";

  return (
    <div className="space-y-8 pb-10">
      <div className="container mx-auto px-4 space-y-10">
        <div className="flex flex-col gap-3">
          <BannerCarousel />
        </div>
        <DiscussionMarquee />
      </div>

      <div className="container mx-auto px-4 space-y-10">
        <DailyTimeline />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {canUseFavoriteAction && (
              <>
                <Link href={favoriteHref}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-10 px-5 border-rose-500/20 text-rose-600 hover:bg-rose-500/5 hover:text-rose-600 rounded-full shadow-sm"
                  >
                    <Heart className="h-4 w-4" />
                    {t("myFavorites")}
                  </Button>
                </Link>
              </>
            )}

            <Link href={myBorrowsHref}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-10 px-5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5 hover:text-emerald-600 rounded-full shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                {t("myBorrows")}
              </Button>
            </Link>

            <Link href={myFinesHref}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-10 px-5 border-red-500/20 text-red-600 hover:bg-red-500/5 hover:text-red-600 rounded-full shadow-sm"
              >
                <DollarSign className="h-4 w-4" />
                {t("myFines")}
              </Button>
            </Link>
          </div>

          <PublicBookGrid showBorrowActions={false} />
        </div>
      </div>
    </div>
  );
}
