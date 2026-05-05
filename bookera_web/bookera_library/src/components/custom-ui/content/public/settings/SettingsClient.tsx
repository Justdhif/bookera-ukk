"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { Settings } from "lucide-react";
import SettingsThemeCard from "./SettingsThemeCard";
import SettingsLanguageCard from "./SettingsLanguageCard";
import SettingsMusicCard from "./SettingsMusicCard";
import SettingsNotificationCard from "./SettingsNotificationCard";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

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
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader title={t("title")} description={t("description")} />
      </FadeUp>
      <FadeUp delay={0.1}>
        <SettingsThemeCard />
      </FadeUp>
      <FadeUp delay={0.2}>
        <SettingsLanguageCard />
      </FadeUp>
      <FadeUp delay={0.3}>
        <SettingsMusicCard />
      </FadeUp>
      <FadeUp delay={0.4}>
        <SettingsNotificationCard />
      </FadeUp>
    </StaggerContainer>
  );
}
