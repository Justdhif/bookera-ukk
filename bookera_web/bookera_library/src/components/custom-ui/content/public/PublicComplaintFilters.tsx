"use client";

import { useTranslations } from "next-intl";
import { Sparkles, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PublicComplaintFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  totalCount: number;
}

export default function PublicComplaintFilters({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  totalCount,
}: PublicComplaintFiltersProps) {
  const t = useTranslations("complaint");

  const categories = ["website", "facility", "service", "other"];
  const statuses = ["pending", "verified", "on_progress", "resolved", "rejected"];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-stretch">
        {/* Category Filter */}
        <div className="relative h-full overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-background via-background/95 to-orange-500/5 p-4 pb-0 shadow-sm backdrop-blur-sm">
          <div className="relative flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/15 bg-orange-500/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("form.categoryLabel")}
                </div>
                <p className="max-w-xl text-sm text-muted-foreground">
                  Filter complaints by category to find specific issues.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 shadow-sm backdrop-blur hidden sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t("totalCases")}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {totalCount} {t("title")}
                </p>
              </div>
            </div>

            <div className="relative mt-2">
              <div className="relative flex min-h-16 items-center overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-2 px-1">
                  <Button
                    type="button"
                    variant={selectedCategory === "" ? "brand" : "outline"}
                    size="sm"
                    className={cn(
                      "shrink-0 rounded-full px-4 transition-all duration-200",
                      selectedCategory === "" && "shadow-md shadow-orange-500/20",
                    )}
                    onClick={() => onCategoryChange("")}
                  >
                    {t("all")}
                  </Button>

                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={selectedCategory === cat ? "brand" : "outline"}
                      size="sm"
                      className={cn(
                        "shrink-0 rounded-full px-4 transition-all duration-200",
                        selectedCategory === cat && "shadow-md shadow-orange-500/20",
                      )}
                      onClick={() => onCategoryChange(cat)}
                    >
                      {t(`category.${cat}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative h-full overflow-hidden rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur-sm min-w-[200px]">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/5 via-transparent to-transparent" />
          <div className="relative flex flex-col h-full justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/15 bg-orange-500/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                <Filter className="h-3.5 w-3.5" />
                {t("statusLabel")}
              </div>
            </div>

            <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("resolutionStatus")}
                </p>
                <Select
                  value={selectedStatus || "all"}
                  onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}
                >
                  <SelectTrigger className="w-full rounded-xl border-border/50">
                    <SelectValue placeholder={t("allStatus")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="all">{t("allStatus")}</SelectItem>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`status.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
