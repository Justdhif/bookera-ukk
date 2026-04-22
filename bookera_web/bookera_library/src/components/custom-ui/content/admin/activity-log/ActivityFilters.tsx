"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityLogFilters as Filters } from "@/types/activity-log";
import { Search } from "lucide-react";

interface ActivityFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function ActivityFilters({
  filters,
  onFilterChange,
}: ActivityFiltersProps) {
  const t = useTranslations("activity-log");
  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    if (searchInput === (filters.search || "")) return;
    const timeout = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput || undefined, page: 1 });
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleActionChange = (value: string) => {
    onFilterChange({
      ...filters,
      action: value === "all" ? undefined : value,
      page: 1,
    });
  };

  const handleModuleChange = (value: string) => {
    onFilterChange({
      ...filters,
      module: value === "all" ? undefined : value,
      page: 1,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
      <div className="relative flex-2 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchDescription")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
        />
      </div>

      <div className="flex flex-row items-center gap-3 w-full sm:flex-1">
        <Select value={filters.action || "all"} onValueChange={handleActionChange}>
          <SelectTrigger className="flex-1 w-full sm:w-auto h-11! shadow-sm transition-all duration-300">
            <SelectValue placeholder={t("filterByAction")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allActions")}</SelectItem>
            <SelectItem value="login">{t("login")}</SelectItem>
            <SelectItem value="logout">{t("logout")}</SelectItem>
            <SelectItem value="create">{t("create")}</SelectItem>
            <SelectItem value="update">{t("update")}</SelectItem>
            <SelectItem value="delete">{t("delete")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.module || "all"} onValueChange={handleModuleChange}>
          <SelectTrigger className="flex-1 w-full sm:w-auto h-11! shadow-sm transition-all duration-300">
            <SelectValue placeholder={t("filterByModule")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allModules")}</SelectItem>
            <SelectItem value="auth">{t("auth")}</SelectItem>
            <SelectItem value="book">{t("book")}</SelectItem>
            <SelectItem value="loan">{t("loan")}</SelectItem>
            <SelectItem value="user">{t("user")}</SelectItem>
            <SelectItem value="category">{t("category")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
