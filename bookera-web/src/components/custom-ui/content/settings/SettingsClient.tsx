"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Monitor,
  Languages,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Settings,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThemeLight from "@/assets/themes/light-theme-icon.svg";
import ThemeDark from "@/assets/themes/dark-theme-icon.svg";
import ThemeSystem from "@/assets/themes/system-theme-icon.svg";
import Image from "next/image";
import { useAudio } from "@/context/AudioContext";

const musicTrack = {
  id: "chill-music",
  name: "Chill Vibes - Lofi Girl",
  file: "/audios/chill-music.mp3",
  duration: "1:01:39",
};

export default function SettingsClient() {
  const t = useTranslations("admin.settings");
  const tLocale = useTranslations("LocaleSwitcher");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    currentLocale as Locale,
  );
  const [isPending, startTransition] = useTransition();

  const {
    isMusicEnabled,
    isPlaying,
    volume,
    currentTime,
    duration,
    toggleMusic,
    togglePlayPause,
    setVolume,
    formatTime,
  } = useAudio();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(t("themeUpdated"));
  };

  const handleLanguageChange = (locale: Locale) => {
    setSelectedLocale(locale);
    startTransition(() => {
      setUserLocale(locale);
      toast.success(t("languageUpdated"));
    });
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleToggleMusic = () => {
    toggleMusic();
    toast.success(
      isMusicEnabled
        ? "Background music turned off"
        : "Background music is now playing",
    );
  };

  const themeOptions = [
    {
      value: "light",
      label: t("light"),
      icon: Sun,
      image: ThemeLight,
    },
    {
      value: "dark",
      label: t("dark"),
      icon: Moon,
      image: ThemeDark,
    },
    {
      value: "system",
      label: t("system"),
      icon: Monitor,
      image: ThemeSystem,
    },
  ];

  const languageOptions = [
    {
      value: "en" as Locale,
      label: tLocale("en"),
      flag: "🇺🇸",
      nativeName: "English",
    },
    {
      value: "id" as Locale,
      label: tLocale("id"),
      flag: "🇮🇩",
      nativeName: "Bahasa Indonesia",
    },
  ];

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

      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl relative">
            {t("themeTitle")}
            <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground"></div>
          </CardTitle>
          <CardDescription className="text-base">
            {t("themeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = mounted && theme === option.value;

              return (
                <button
                  key={option.value}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "ring-4 ring-brand-primary shadow-xl"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => handleThemeChange(option.value)}
                >
                  <div className="relative h-56">
                    <Image
                      src={option.image}
                      alt={option.label}
                      fill
                      className="object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent ${
                        isActive ? "from-brand-primary/80" : ""
                      }`}
                    />

                    <div className="absolute bottom-4 left-4 text-white flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{option.label}</span>
                    </div>

                    {isActive && (
                      <div className="absolute top-4 right-4 bg-brand-primary text-white p-2 rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl relative">
            {t("languageTitle")}
            <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground"></div>
          </CardTitle>
          <CardDescription className="text-base">
            {t("languageDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <Label htmlFor="language-select" className="text-base mb-2 block">
              Select Language
            </Label>
            <Select
              value={selectedLocale}
              onValueChange={(value) => handleLanguageChange(value as Locale)}
              disabled={isPending}
            >
              <SelectTrigger
                id="language-select"
                className="w-full h-12 text-base"
              >
                <SelectValue placeholder="Choose a language">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {
                        languageOptions.find((l) => l.value === selectedLocale)
                          ?.flag
                      }
                    </span>
                    <span>
                      {
                        languageOptions.find((l) => l.value === selectedLocale)
                          ?.label
                      }
                    </span>
                    <span className="text-muted-foreground">
                      (
                      {
                        languageOptions.find((l) => l.value === selectedLocale)
                          ?.nativeName
                      }
                      )
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.nativeName}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl relative">
            Background Music
            <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground"></div>
          </CardTitle>
          <CardDescription className="text-base">
            Relax with ambient background music while using the application
            (auto-loop)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-linear-to-r from-primary/5 to-transparent rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{musicTrack.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Duration: {musicTrack.duration} • Auto-loop enabled
                </p>
              </div>
            </div>
            <Button
              size="lg"
              variant={isMusicEnabled ? "default" : "outline"}
              className={`relative transition-all ${isMusicEnabled ? "ring-4 ring-primary/30" : ""}`}
              onClick={handleToggleMusic}
            >
              {isMusicEnabled ? "Disable Music" : "Enable Music"}
            </Button>
          </div>

          {isMusicEnabled && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full hover:bg-primary hover:text-white transition-colors"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Volume Control</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setVolume(Math.max(0, volume - 10))}
                  >
                    <VolumeX className="h-4 w-4" />
                  </Button>

                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setVolume(Math.min(100, volume + 10))}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>

                  <span className="text-sm font-medium w-12 text-right">
                    {volume}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div
                  className={`h-2 w-2 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
                />
                <span className="text-sm">
                  {isPlaying ? "Music is playing" : "Music is paused"}
                </span>
                {isPlaying && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Auto-loop active
                  </span>
                )}
              </div>
            </>
          )}

          {!isMusicEnabled && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Background music is currently disabled</p>
              <p className="text-sm">
                Click &quot;Enable Music&quot; to start playing ambient
                background music
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
