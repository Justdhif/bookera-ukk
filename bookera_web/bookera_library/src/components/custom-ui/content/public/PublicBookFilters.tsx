"use client";

import { useTranslations } from "next-intl";
import { Sparkles, BookPlus, Star } from "lucide-react";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DataLoading from "@/components/custom-ui/DataLoading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PublicBookFiltersProps {
  categories: Category[];
  categoriesLoading: boolean;
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  selectedRating: string | null;
  onRatingSelect: (value: string) => void;
  selectedMinReviews: number | null;
  onReviewSelect: (value: string) => void;
  selectedCount?: number;
  visibleCount?: number;
  onSelectAll?: (checked: boolean) => void;
  onBorrowRequest?: () => void;
  showBorrowActions?: boolean;
}

const reviewOptions = [50, 25, 10, 5];

export default function PublicBookFilters({
  categories,
  categoriesLoading,
  selectedCategoryId,
  onCategorySelect,
  selectedRating,
  onRatingSelect,
  selectedMinReviews,
  onReviewSelect,
  selectedCount = 0,
  visibleCount = 0,
  onSelectAll,
  onBorrowRequest,
  showBorrowActions = true,
}: PublicBookFiltersProps) {
  const t = useTranslations("navbar");
  const tCommon = useTranslations("common");
  const tPublic = useTranslations("public");

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center gap-4 w-full",
          "justify-end",
        )}
      >

        {showBorrowActions && (
          <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-muted/40 rounded-full border border-border/50 shadow-sm backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedCount === visibleCount && visibleCount > 0}
                disabled={visibleCount === 0}
                onCheckedChange={(c) => onSelectAll?.(c === true)}
              />
              <Label
                htmlFor="select-all"
                className={
                  visibleCount > 0
                    ? "text-sm font-medium cursor-pointer select-none whitespace-nowrap hover:text-primary transition-colors"
                    : "text-sm font-medium cursor-not-allowed select-none whitespace-nowrap opacity-50"
                }
              >
                {tPublic("common.selectAll")} ({selectedCount}/{visibleCount})
              </Label>
            </div>
            <div className="w-px h-5 bg-border/80"></div>
            <Button
              variant="submit"
              size="sm"
              disabled={selectedCount === 0 || visibleCount === 0}
              onClick={onBorrowRequest}
              className="h-8 gap-2 rounded-full px-5 shadow-xs"
            >
              <BookPlus className="h-3.5 w-3.5" />
              {tPublic("detail.borrowSelected")}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] xl:items-stretch">
        <div className="relative h-full overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-background via-background/95 to-brand-primary/5 p-4 pb-0 shadow-sm backdrop-blur-sm">
          <div className="relative flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {tPublic("categoryFilter")}
                </div>
                <p className="max-w-xl text-sm text-muted-foreground">
                  {tPublic("categoryFilterHint")}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {tPublic("categoryCountLabel")}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {categories.length} {tPublic("categoryCountSuffix")}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative flex min-h-25 items-center overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-2 px-1">
                  <Button
                    type="button"
                    variant={selectedCategoryId === null ? "brand" : "outline"}
                    size="sm"
                    className={cn(
                      "shrink-0 rounded-full px-4 transition-all duration-200",
                      selectedCategoryId === null &&
                        "shadow-md shadow-brand-primary/20",
                    )}
                    onClick={() => onCategorySelect(null)}
                  >
                    {tPublic("all")}
                  </Button>

                  {categoriesLoading && (
                    <div className="flex items-center justify-center pl-2">
                      <DataLoading variant="inline" size="sm" />
                    </div>
                  )}

                  {!categoriesLoading &&
                    categories.map((category) => {
                      const isActive = selectedCategoryId === category.id;

                      return (
                        <Button
                          key={category.id}
                          type="button"
                          variant={isActive ? "brand" : "outline"}
                          size="sm"
                          className={cn(
                            "shrink-0 rounded-full px-4 transition-all duration-200 hover:-translate-y-0.5",
                            isActive && "shadow-md shadow-brand-primary/20",
                          )}
                          onClick={() => onCategorySelect(category.id)}
                        >
                          {category.name}
                        </Button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-full overflow-hidden rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-brand-primary/5 via-transparent to-transparent" />
          <div className="relative flex flex-col">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                <Star className="h-3.5 w-3.5" />
                {tPublic("ratingReviewFilter")}
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                {tPublic("ratingReviewFilterHint")}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {tPublic("ratingFilter")}
                </p>
                <Select
                  value={
                    selectedRating !== null
                      ? String(selectedRating)
                      : "all"
                  }
                  onValueChange={(val) => onRatingSelect(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tPublic("all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tPublic("all")}</SelectItem>
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <SelectItem key={stars} value={String(stars)}>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span>{stars}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {tPublic("reviewFilter")}
                </p>
                <Select
                  value={
                    selectedMinReviews !== null
                      ? String(selectedMinReviews)
                      : "all"
                  }
                  onValueChange={onReviewSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tPublic("all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tPublic("all")}</SelectItem>
                    {reviewOptions.map((reviewCount) => (
                      <SelectItem key={reviewCount} value={String(reviewCount)}>
                        {reviewCount}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
