"use client";

import BannerCarousel from "./BannerCarousel";
import DailyTimeline from "./DailyTimeline";
import PublicMixedGrid from "@/components/custom-ui/content/public/PublicMixedGrid";

import { StaggerContainer, FadeUp, ScaleIn, BlurIn } from "@/components/custom-ui/motion";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";

export default function PublicPageClient() {
  const t = useTranslations("navbar");
  const user = useAuthStore((state) => state.user);

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
          <FadeUp delay={0.4}>
            <PublicMixedGrid />
          </FadeUp>
        </div>
      </div>
    </StaggerContainer>
  );
}


