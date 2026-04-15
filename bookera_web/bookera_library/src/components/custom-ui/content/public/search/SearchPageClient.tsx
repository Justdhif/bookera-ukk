"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import PublicBookGrid from "@/components/custom-ui/content/book/PublicBookGrid";

export default function SearchPageClient() {
  const t = useTranslations("public.search");
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  return (
    <div className="container space-y-6 px-4">
      <ContentHeader
        title={t("title")}
        description={
          <>
            {t("showingResultsFor")}
            <span className="font-semibold text-foreground ml-1">
              &quot;{query}&quot;
            </span>
          </>
        }
        className="pb-4"
      />

      <div className="space-y-10">
        <PublicBookGrid search={query} />
      </div>
    </div>
  );
}
