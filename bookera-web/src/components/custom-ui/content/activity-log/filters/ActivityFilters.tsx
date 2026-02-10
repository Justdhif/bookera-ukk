"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityLogFilters as Filters } from "@/types/activity-log";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ActivityFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function ActivityFilters({
  filters,
  onFilterChange,
}: ActivityFiltersProps) {
  const t = useTranslations('admin.activityLogs');
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFilterChange({ ...localFilters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters: Filters = { page: 1, per_page: 15 };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchDescription')}
              value={localFilters.search || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, search: e.target.value })
              }
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>

          <Select
            value={localFilters.action || "all"}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, action: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filterByAction')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allActions')}</SelectItem>
              <SelectItem value="login">{t('login')}</SelectItem>
              <SelectItem value="logout">{t('logout')}</SelectItem>
              <SelectItem value="create">{t('create')}</SelectItem>
              <SelectItem value="update">{t('update')}</SelectItem>
              <SelectItem value="delete">{t('delete')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={localFilters.module || "all"}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, module: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filterByModule')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allModules')}</SelectItem>
              <SelectItem value="auth">{t('auth')}</SelectItem>
              <SelectItem value="book">{t('book')}</SelectItem>
              <SelectItem value="loan">{t('loan')}</SelectItem>
              <SelectItem value="user">{t('user')}</SelectItem>
              <SelectItem value="category">{t('category')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} variant="brand" className="flex-1 shadow-sm hover:shadow-md transition-shadow">
              <Search className="h-4 w-4 mr-2" />
              {t('applyFilter')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="icon" className="hover:bg-destructive hover:text-white hover:border-destructive transition-colors">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
