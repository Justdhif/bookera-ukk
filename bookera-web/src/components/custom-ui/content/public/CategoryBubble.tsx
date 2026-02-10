"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import CategoryBubbleSkeleton from "./CategoryBubbleSkeleton";
import { ChevronRight, ChevronLeft, Filter, BookOpen } from "lucide-react";
import { getIconByName } from "@/lib/icons";
import { useTranslations } from "next-intl";

interface Props {
  active: number | null;
  onChange: (id: number | null) => void;
  showFilterIcon?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function CategoryBubble({
  active,
  onChange,
  showFilterIcon = false,
}: Props) {
  const t = useTranslations('common');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

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

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm">{t('noCategoryAvailable')}</p>
      </div>
    );
  }

  const allItems = [{ id: null, name: t('all') }, ...categories];
  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = allItems.slice(startIndex, endIndex);

  const handleCategoryClick = (id: number | null) => {
    onChange(id);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="relative">
      {/* Header dengan filter icon */}
      {showFilterIcon && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            KATEGORI
          </h3>
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative flex items-center gap-4">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl disabled:opacity-30 transition-all duration-300 border border-gray-200 dark:border-gray-700 z-10"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Categories Grid - Fixed Height Container with Overflow Hidden */}
        <div className="flex-1 overflow-hidden">
          <div className="relative" style={{ minHeight: '220px' }}>
            {/* Sliding Container - Wrapper for all pages */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentPage * 100}%)`,
              }}
            >
              {/* Generate pages */}
              {Array.from({ length: totalPages }).map((_, pageIndex) => {
                const pageStartIndex = pageIndex * ITEMS_PER_PAGE;
                const pageEndIndex = pageStartIndex + ITEMS_PER_PAGE;
                const pageItems = allItems.slice(pageStartIndex, pageEndIndex);

                return (
                  <div
                    key={`page-${pageIndex}`}
                    className="w-full shrink-0 px-1"
                    style={{ width: '100%' }}
                  >
                    <div className="grid grid-cols-5 gap-4">
                      {pageItems.map((item) => {
                        const isActive = active === item.id;
                        const itemId = item.id === null ? "null" : item.id;
                        const categoryItem = item.id === null ? null : categories.find(c => c.id === item.id);
                        
                        // Get icon component from lucide-react
                        const IconComponent = categoryItem?.icon 
                          ? getIconByName(categoryItem.icon) 
                          : null;

                        return (
                          <div
                            key={`category-${itemId}`}
                            className="w-full"
                          >
                            <button
                              onClick={() => handleCategoryClick(item.id)}
                              className={`
                                w-full flex flex-col items-center justify-center gap-3 p-4 rounded-xl
                                transition-all duration-300 group relative
                                ${
                                  isActive
                                    ? "bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-105"
                                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md"
                                }
                              `}
                              style={{ minHeight: '160px' }}
                            >
                              {/* Icon Container */}
                              <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center
                                transition-all duration-300
                                ${
                                  isActive
                                    ? "bg-white/20"
                                    : "bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50"
                                }
                              `}>
                                {IconComponent ? (
                                  <IconComponent className={`h-8 w-8 ${
                                    isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                                  }`} />
                                ) : (
                                  <BookOpen className={`h-8 w-8 ${
                                    isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                                  }`} />
                                )}
                              </div>

                              {/* Category Name */}
                              <span className={`
                                text-sm font-semibold text-center line-clamp-2
                                ${
                                  isActive
                                    ? "text-white"
                                    : "text-gray-700 dark:text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                                }
                              `}>
                                {item.name}
                              </span>

                              {/* Active Indicator */}
                              {isActive && (
                                <div className="absolute top-2 right-2">
                                  <div className="relative">
                                    <div className="w-3 h-3 bg-white rounded-full" />
                                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
                                  </div>
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl disabled:opacity-30 transition-all duration-300 border border-gray-200 dark:border-gray-700 z-10"
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Page Indicator */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {currentPage + 1} / {totalPages}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentPage 
                  ? "w-8 bg-emerald-500" 
                  : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-emerald-400 dark:hover:bg-emerald-600"
              }`}
              onClick={() => setCurrentPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
