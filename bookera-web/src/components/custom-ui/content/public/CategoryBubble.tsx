"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import CategoryBubbleSkeleton from "./CategoryBubbleSkeleton";
import { ChevronRight, Filter } from "lucide-react";

interface Props {
  active: number | null;
  onChange: (id: number | null) => void;
  showFilterIcon?: boolean;
}

export default function CategoryBubble({
  active,
  onChange,
  showFilterIcon = false,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        setCategories(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <CategoryBubbleSkeleton />;

  // Jika tidak ada kategori
  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm">Tidak ada kategori tersedia</p>
      </div>
    );
  }

  const handleCategoryClick = (id: number | null) => {
    onChange(id);
    // Smooth scroll untuk mobile
    const element = document.getElementById(`category-${id}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <div className="relative">
      {/* Header dengan filter icon */}
      {showFilterIcon && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filter Kategori
          </h3>
        </div>
      )}

      {/* Container dengan overflow scroll dan custom scrollbar */}
      <div className="relative">
        {/* Fade effect di ujung kanan */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white to-transparent dark:from-gray-900 z-10 pointer-events-none" />

        {/* Scroll container */}
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide scroll-smooth px-1">
          {/* Badge "Semua" */}
          <div id="category-null" className="shrink-0">
            <Badge
              variant={active === null ? "default" : "outline"}
              className={`
                cursor-pointer whitespace-nowrap transition-all duration-300
                px-4 py-2 text-sm font-medium
                 hover:shadow-md
                ${
                  active === null
                    ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500"
                    : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                }
                group relative overflow-hidden
              `}
              onClick={() => handleCategoryClick(null)}
            >
              {/* Active indicator dot */}
              {active === null && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                Semua
                <ChevronRight
                  className={`h-3 w-3 transition-transform duration-300 ${active === null ? "translate-x-0" : "translate-x-0 group-hover:translate-x-1"}`}
                />
              </span>

              {/* Active background effect */}
              {active === null && (
                <div className="absolute inset-0 bg-linear-to-r from-emerald-400/20 to-emerald-600/20" />
              )}
            </Badge>
          </div>

          {/* Badge kategori */}
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`category-${cat.id}`}
              className="shrink-0"
            >
              <Badge
                variant={active === cat.id ? "default" : "outline"}
                className={`
                  cursor-pointer whitespace-nowrap transition-all duration-300
                  px-4 py-2 text-sm font-medium
                   hover:shadow-md
                  ${
                    active === cat.id
                      ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500"
                      : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  }
                  group relative overflow-hidden
                `}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {/* Active indicator dot */}
                {active === cat.id && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  {cat.name}
                  <ChevronRight
                    className={`h-3 w-3 transition-transform duration-300 ${active === cat.id ? "translate-x-0" : "translate-x-0 group-hover:translate-x-1"}`}
                  />
                </span>

                {/* Active background effect */}
                {active === cat.id && (
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-400/20 to-emerald-600/20" />
                )}
              </Badge>
            </div>
          ))}
        </div>

        {/* Scroll indicator untuk mobile */}
        <div className="flex justify-center mt-2 md:hidden">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-300/50"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
