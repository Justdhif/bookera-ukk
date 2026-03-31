"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Category } from "@/types/category";
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
  onChange: (partial: {
    search?: string;
    category_ids?: number[];
    status?: string;
  }) => void;
  isLoading?: boolean;
}

export function BookFilter({ categories, onChange, isLoading = false }: Props) {
  const t = useTranslations("book");
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

  const handleCategoryChange = (val: string) => {
    const id = val === "all" ? null : Number(val);
    const newIds = id === null ? [] : [id];
    setCategoryIds(newIds);
    onChange({ category_ids: newIds.length > 0 ? newIds : undefined });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchBooks")}
          value={searchInput}
          onChange={handleSearchChange}
          className="pl-9 h-11"
        />
      </div>

      <div className="flex flex-row gap-3 sm:w-auto">
        <Select
          value={categoryIds.length > 0 ? String(categoryIds[0]) : "all"}
          onValueChange={handleCategoryChange}
          disabled={isLoading}
        >
          <SelectTrigger className="flex-1 sm:w-48 h-11">
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="flex-1 sm:w-40 h-11">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
