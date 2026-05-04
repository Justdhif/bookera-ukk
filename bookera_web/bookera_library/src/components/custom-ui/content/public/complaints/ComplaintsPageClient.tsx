"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X, MessageSquarePlus } from "lucide-react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import PublicComplaintGrid from "./PublicComplaintGrid";
import ComplaintFormSheet from "./ComplaintFormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { FadeUp, StaggerContainer } from "@/components/custom-ui/motion";

export default function ComplaintsPageClient() {
  const t = useTranslations("complaint");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = (searchParams.get("q") ?? "").trim();
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [refreshToken, setRefreshToken] = useState(0);
  const debouncedQuery = useDebounce(searchQuery, 300).trim();

  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    if (debouncedQuery === queryFromUrl) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [debouncedQuery, pathname, queryFromUrl, router, searchParams]);

  return (
    <StaggerContainer className="container space-y-6 px-4">
      <FadeUp>
        <ContentHeader
          title={t("welcomeTitle")}
          description={t("welcomeSubtitle")}
          className="pb-4"
          rightActions={
            <ComplaintFormSheet
              onSuccess={() => setRefreshToken((value) => value + 1)}
              trigger={
                <Button
                  variant="submit"
                  className="gap-2 rounded-full px-5 shadow-sm"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  {t("submitButton")}
                </Button>
              }
            />
          }
        />
      </FadeUp>

      <FadeUp delay={0.08}>
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-xl border-border/60 pl-10 pr-10"
            autoComplete="off"
          />

          {searchQuery ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
              aria-label={t("searchPlaceholder")}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </FadeUp>

      <FadeUp delay={0.16}>
        <PublicComplaintGrid
          search={debouncedQuery}
          refreshToken={refreshToken}
        />
      </FadeUp>
    </StaggerContainer>
  );
}