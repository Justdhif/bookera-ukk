"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { DiscussionPost } from "@/types/discussion";
import { publicService } from "@/services/public.service";
import { useTranslations } from "next-intl";
import Link from "next/link";
import PublicDiscussionCard from "./PublicDiscussionCard";

export default function DiscussionMarquee() {
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("public");

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await publicService.getTopDiscussions();
        setDiscussions(res.data.data);
      } catch (error) {
        console.error("Failed to fetch top discussions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  if (loading || discussions.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-1">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-gradient-brand">
            {t("discussions")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("communityVoicesDesc")}
          </p>
        </div>
        <Link
          href="/discussions"
          className="text-sm font-semibold text-primary hover:underline underline-offset-4 mb-1"
        >
          {t("viewAll") || "View All"} →
        </Link>
      </div>
      <Marquee
        gradient={true}
        gradientColor="transparent"
        gradientWidth={100}
        pauseOnHover={true}
        speed={35}
        className="py-4 overflow-hidden"
      >
        {discussions.map((discussion) => (
          <PublicDiscussionCard
            key={discussion.id}
            discussion={discussion}
            className="mx-3 w-[320px]"
          />
        ))}
      </Marquee>
    </div>
  );
}
