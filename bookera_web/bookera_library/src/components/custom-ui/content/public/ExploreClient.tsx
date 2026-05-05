"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PublicBookGrid from "./PublicBookGrid";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function ExploreClient() {
  const tExplore = useTranslations("explore");
  const tNavbar = useTranslations("navbar");
  const { user, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState("");

  const welcomeMessage =
    isAuthenticated && user
      ? `${tExplore("welcome")}, ${user.profile?.full_name || user.email.split("@")[0]}`
      : tExplore("title");

  return (
    <StaggerContainer className="container mx-auto space-y-8 min-h-screen">
      <FadeUp>
        <ContentHeader
          title={welcomeMessage}
          description={tExplore("booksSubtitle")}
        />
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="flex flex-col space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={tNavbar("bookSearchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 w-full rounded-2xl bg-card border border-border/60 focus-visible:ring-primary/30 shadow-xs text-base transition-all dark:bg-input/30"
            />
          </div>

          <div className="mt-6">
            <PublicBookGrid search={search} />
          </div>
        </div>
      </FadeUp>
    </StaggerContainer>
  );
}
