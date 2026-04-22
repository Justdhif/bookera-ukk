"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import ComplaintFormSheet from "./ComplaintFormSheet";

interface ComplaintHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh?: () => void;
}

export default function ComplaintHeader({
  search,
  onSearchChange,
  onRefresh,
}: ComplaintHeaderProps) {
  const t = useTranslations("complaint");
  const { user, isAuthenticated } = useAuthStore();

  const welcomeMessage =
    isAuthenticated && user
      ? `${t("welcomeBack")}, ${user.profile?.full_name || user.email.split("@")[0]}`
      : t("welcomeTitle");

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {welcomeMessage}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t("welcomeSubtitle")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-card border-2 focus-visible:ring-primary shadow-sm text-base transition-all dark:bg-input/30"
          />
        </div>
        {isAuthenticated && (
          <ComplaintFormSheet onSuccess={onRefresh}>
            <Button
              size="lg"
              variant="submit"
              className="rounded-2xl h-14 px-8 gap-2 w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              <span>{t("submitButton")}</span>
            </Button>
          </ComplaintFormSheet>
        )}
      </div>
    </div>
  );
}
