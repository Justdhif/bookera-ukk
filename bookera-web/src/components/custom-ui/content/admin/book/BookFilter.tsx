"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  categories: Category[];
  onChange: (partial: { search?: string; category_ids?: number[]; status?: string }) => void;
  isLoading?: boolean;
}

export function BookFilter({ categories, onChange, isLoading = false }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [statusSelect, setStatusSelect] = useState<string>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange({ search: searchInput || undefined });
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);

  const statusValue = statusSelect ?? "all";
  const handleStatusChange = (v: string) => {
    const newStatus = v === "all" ? undefined : v;
    setStatusSelect(newStatus);
    onChange({ status: newStatus });
  };

  const handleCategoryToggle = (id: number | null) => {
    let newIds: number[];
    if (id === null) {
      newIds = [];
    } else {
      newIds = categoryIds.includes(id)
        ? categoryIds.filter((cId) => cId !== id)
        : [...categoryIds, id];
    }
    setCategoryIds(newIds);
    onChange({ category_ids: newIds.length > 0 ? newIds : undefined });
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

  const CategorySkeleton = () => (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
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
          <span className="flex items-center gap-1.5 text-white">All Categories</span>
        </Badge>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="shrink-0">
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <Select
          value={statusValue}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none rounded-r-md" />

        {isLoading ? (
          <CategorySkeleton />
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
            <div id="book-category-null" className="shrink-0">
              <Badge
                variant={isAllActive ? "default" : "outline"}
                className={`
                  cursor-pointer whitespace-nowrap transition-all duration-200
                  px-3 py-2 text-sm font-medium
                  rounded-md border
                  ${
                    isAllActive
                      ? "bg-brand-primary border-brand-primary shadow-sm text-white"
                      : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
                  }
                `}
                onClick={() => handleCategoryClick(null)}
              >
                <span className="flex items-center gap-1.5">
                  All Categories
                </span>
              </Badge>
            </div>

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
                          ? "bg-brand-primary border-brand-primary shadow-sm text-white"
                          : "bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
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
        )}
      </div>
    </div>
  );
}
