"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
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
      <ContentHeader
        title={t("title")}
        description={t("description")}
      />
      <SettingsThemeCard />
      <SettingsLanguageCard />
      <SettingsMusicCard />
      <SettingsNotificationCard />
    </div>
  );
}
