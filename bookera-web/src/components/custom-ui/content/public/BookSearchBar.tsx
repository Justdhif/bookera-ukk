"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Search } from "lucide-react";
import { useTranslations } from 'next-intl';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  onRefresh: () => void;
}

export default function BookSearchBar({ search, onSearch, onRefresh }: Props) {
  const t = useTranslations('search');
  
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('placeholder')}
          className="pl-9"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <Button variant="outline" onClick={onRefresh}>
        <RotateCcw className="h-4 w-4 mr-2" />
        {t('refresh')}
      </Button>
    </div>
  );
}
