"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Languages, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";
import { useLocale } from "next-intl";
import { toast } from "sonner";

export default function SettingsClient() {
  const t = useTranslations('admin.settings');
  const tCommon = useTranslations('admin.common');
  const tLocale = useTranslations('LocaleSwitcher');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale as Locale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(t('themeUpdated'));
  };

  const handleLanguageChange = (locale: Locale) => {
    setSelectedLocale(locale);
    startTransition(() => {
      setUserLocale(locale);
      toast.success(t('languageUpdated'));
    });
  };

  const themeOptions = [
    { value: "light", label: t('light'), icon: Sun },
    { value: "dark", label: t('dark'), icon: Moon },
    { value: "system", label: t('system'), icon: Monitor },
  ];

  const languageOptions = [
    { value: "en" as Locale, label: tLocale('en'), flag: "🇺🇸" },
    { value: "id" as Locale, label: tLocale('id'), flag: "🇮🇩" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            {t('themeTitle')}
          </CardTitle>
          <CardDescription>{t('themeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = mounted && theme === option.value;
              
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  className={`h-24 relative ${
                    isActive 
                      ? "ring-2 ring-primary" 
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handleThemeChange(option.value)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-6 w-6" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t('languageTitle')}
          </CardTitle>
          <CardDescription>{t('languageDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languageOptions.map((option) => {
              const isActive = selectedLocale === option.value;
              
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  className={`h-24 relative ${
                    isActive 
                      ? "ring-2 ring-primary" 
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handleLanguageChange(option.value)}
                  disabled={isPending}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{option.flag}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
