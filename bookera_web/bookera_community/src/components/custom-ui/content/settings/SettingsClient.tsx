"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import SettingsThemeCard from "./SettingsThemeCard";
import SettingsLanguageCard from "./SettingsLanguageCard";
import SettingsMusicCard from "./SettingsMusicCard";
import SettingsNotificationCard from "./SettingsNotificationCard";

export default function SettingsClient() {
    const t = useTranslations("settings");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-brand-primary rounded-lg">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <SettingsThemeCard />
      <SettingsLanguageCard />
      <SettingsMusicCard />
      <SettingsNotificationCard />
    </div>
  );
}
