"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Props {
  categories: Category[];
  onChange: (params: Record<string, string | number[] | undefined>) => void;
}

export function BookFilter({ categories, onChange }: Props) {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin.common')
  const [searchValue, setSearchValue] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [statusValue, setStatusValue] = useState<string>();

  const handleCategoryToggle = (id: number | null) => {
    if (id === null) {
      setCategoryIds([]);
      onChange({ category_ids: undefined });
    } else {
      const newIds = categoryIds.includes(id)
        ? categoryIds.filter((cId) => cId !== id)
        : [...categoryIds, id];
      setCategoryIds(newIds);
      onChange({ category_ids: newIds.length > 0 ? newIds : undefined });
    }
  };

  const handleCategoryClick = (id: number | null) => {
    handleCategoryToggle(id);
    const element = document.getElementById(`book-category-${id}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const isAllActive = categoryIds.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tAdmin('searchBooksPlaceholder')}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onChange({ search: e.target.value });
            }}
            className="pl-9"
          />
        </div>

        {/* Status Select */}
        <Select 
          value={statusValue}
          onValueChange={(v) => {
            const newValue = v === "all" ? undefined : v;
            setStatusValue(newValue);
            onChange({ status: newValue });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Kategori - Scroll Horizontal */}
      <div className="relative">
        {/* Fade effect di ujung kanan */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none rounded-r-md" />

        {/* Scroll container */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
          {/* Badge "Semua" */}
          <div id="book-category-null" className="shrink-0">
            <Badge
              variant={isAllActive ? "default" : "outline"}
              className={`
                cursor-pointer whitespace-nowrap transition-all duration-200
                px-3 py-2 text-sm font-medium
                rounded-md border
                ${
                  isAllActive
                    ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
                }
              `}
              onClick={() => handleCategoryClick(null)}
            >
              <span className="flex items-center gap-1.5">
                Semua
              </span>
            </Badge>
          </div>

          {/* Badge kategori */}
          {categories.map((cat) => {
            const isActive = categoryIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                id={`book-category-${cat.id}`}
                className="shrink-0"
              >
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={`
                    cursor-pointer whitespace-nowrap transition-all duration-200
                    px-3 py-2 text-sm font-medium
                    rounded-md border
                    ${
                      isActive
                        ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                        : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
                    }
                  `}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <span className="flex items-center gap-1.5">
                    {cat.name}
                  </span>
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
