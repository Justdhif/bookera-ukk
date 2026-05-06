"use client";

import BannerCarousel from "./BannerCarousel";
import DailyTimeline from "./DailyTimeline";
import PublicBookGrid from "@/components/custom-ui/content/public/PublicBookGrid";

import { Heart, BookOpen, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StaggerContainer, FadeUp, ScaleIn, BlurIn, SlideIn } from "@/components/custom-ui/motion";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";

export default function PublicPageClient() {
  const t = useTranslations("navbar");
  const user = useAuthStore((state) => state.user);
  const canUseFavoriteAction = Boolean(user && user.role !== "user");
  const favoriteHref = user ? `/${user.slug}/favorite` : "/login?redirect=/favorite";
  const myBorrowsHref = user ? `/${user.slug}/borrow` : "/login?redirect=/borrow";
  const myFinesHref = user ? `/${user.slug}/fine` : "/login?redirect=/fine";

  return (
    <StaggerContainer className="space-y-8 pb-10">
      <ScaleIn>
        <div className="container mx-auto px-4 space-y-10">
          <div className="flex flex-col gap-3">
            <BannerCarousel />
          </div>
        </div>
      </ScaleIn>

      <div className="container mx-auto px-4 space-y-10">
        <BlurIn delay={0.2}>
          <DailyTimeline />
        </BlurIn>

        <div className="space-y-6">
          <SlideIn direction="up" delay={0.3}>
            <div className="flex flex-wrap items-center gap-3">
              {canUseFavoriteAction && (
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
          </SlideIn>

          <FadeUp delay={0.4}>
            <PublicBookGrid showBorrowActions={false} />
          </FadeUp>
        </div>
      </div>
    </StaggerContainer>
  );
}


