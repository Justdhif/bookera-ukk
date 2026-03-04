"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import CategoryBubbleSkeleton from "./CategoryBubbleSkeleton";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { getIconByName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  active: number | null;
  onChange: (id: number | null) => void;
  showFilterIcon?: boolean;
}

const ITEMS_PER_PAGE_MOBILE = 3;
const ITEMS_PER_PAGE_DESKTOP = 6;

export default function CategoryBubble({
  active,
  onChange,
  showFilterIcon = false,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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
        <p className="text-muted-foreground text-sm">{"No categories available"}</p>
      </div>
    );
  }

  const allItems = [{ id: null, name: "All", icon: null }, ...categories];
  const itemsPerPage = isDesktop ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(allItems.length / itemsPerPage);

  const handleCategoryClick = (id: number | null) => {
    onChange(id);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const visibleItems = allItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="relative space-y-3">
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={cn(
            "shrink-0 h-10 w-10 rounded-full transition-all duration-300 shadow-md",
            currentPage === 0 
              ? "opacity-30 cursor-not-allowed" 
              : "hover:scale-110 hover:shadow-lg"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 overflow-hidden">
          <div 
            key={currentPage}
            className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 animate-in fade-in slide-in-from-right-4 duration-700 p-2"
          >
            {visibleItems.map((item) => {
              const isActive = active === item.id;
              const IconComponent = item.icon ? getIconByName(item.icon) : null;

              return (
                <button
                  key={item.id === null ? "all" : item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
                    "aspect-4/5",
                    isActive
                      ? "bg-linear-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-background"
                      : "bg-card hover:bg-accent border-2 border-border hover:border-emerald-400/60 dark:hover:border-emerald-500/60 hover:shadow-lg"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                    </div>
                  )}

                  
                  <div
                    className={cn(
                      "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                      isActive
                        ? "bg-white/25 shadow-lg backdrop-blur-sm"
                        : "bg-emerald-100 dark:bg-emerald-900/30"
                    )}
                  >
                    {IconComponent ? (
                      <IconComponent
                        className={cn(
                          "h-7 w-7 md:h-8 md:w-8",
                          isActive ? "text-white drop-shadow-md" : "text-emerald-600 dark:text-emerald-400"
                        )}
                      />
                    ) : (
                      <BookOpen
                        className={cn(
                          "h-7 w-7 md:h-8 md:w-8",
                          isActive ? "text-white drop-shadow-md" : "text-emerald-600 dark:text-emerald-400"
                        )}
                      />
                    )}
                  </div>

                  
                  <span
                    className={cn(
                      "text-sm md:text-base font-bold text-center line-clamp-2 px-2 relative z-10",
                      isActive
                        ? "text-white drop-shadow-md"
                        : "text-foreground"
                    )}
                  >
                    {item.name}
                  </span>

                  
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white rounded-full shadow-lg" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className={cn(
            "shrink-0 h-10 w-10 rounded-full transition-all duration-300 shadow-md",
            currentPage === totalPages - 1 
              ? "opacity-30 cursor-not-allowed"
              : "hover:scale-110 hover:shadow-lg"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                index === currentPage
                  ? "w-8 bg-linear-to-r from-emerald-500 to-emerald-600 shadow-md"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50 hover:w-4"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
