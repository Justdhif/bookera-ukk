"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ThemeLight from "@/assets/themes/light-theme-icon.svg";
import ThemeDark from "@/assets/themes/dark-theme-icon.svg";
import ThemeSystem from "@/assets/themes/system-theme-icon.svg";
import { toast } from "sonner";

const getThemeOptions = (t: any) => [
  { value: "light", label: t("light"), icon: Sun, image: ThemeLight },
  { value: "dark", label: t("dark"), icon: Moon, image: ThemeDark },
  { value: "system", label: t("system"), icon: Monitor, image: ThemeSystem },
];

export default function SettingsThemeCard() {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const themeOptions = [
    { value: "light", label: t("light"), icon: Sun, image: ThemeLight },
    { value: "dark", label: t("dark"), icon: Moon, image: ThemeDark },
    { value: "system", label: t("system"), icon: Monitor, image: ThemeSystem },
  ];
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(t("themeUpdated"));
  };
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl relative">
          {t("themeTitle")}
          <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-base">
          {t("themeDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <div
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl border-2 transition-all duration-500 cursor-pointer",
                  isActive
                    ? "border-brand-primary bg-brand-primary/3 shadow-2xl shadow-brand-primary/20 z-10"
                    : "border-border hover:border-brand-primary/40 hover:bg-accent/10 hover:shadow-xl"
                )}
              >
                <div 
                  className={cn(
                    "relative h-56 w-full overflow-hidden flex items-center justify-center",
                    option.value === "light" && "bg-slate-50",
                    option.value === "dark" && "bg-slate-950",
                    option.value === "system" && "bg-linear-to-br from-slate-50 to-slate-950"
                  )}
                >
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    className="object-cover transition-all duration-1000 ease-out"
                    priority
                  />
                  
                  <div className={cn(
                    "absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur-xl border-2 shadow-2xl transition-all duration-500",
                    isActive 
                      ? "bg-brand-primary/90 border-white/30 text-white scale-110 rotate-3" 
                      : "bg-background/40 border-white/10 text-muted-foreground group-hover:bg-background/60 group-hover:rotate-0"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "")} />
                  </div>

                  {/* Selected Indicator Badge */}
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-brand-primary/40 to-transparent pointer-events-none" />
                  )}
                  
                  {isActive && (
                    <div className="absolute bottom-4 left-4 flex h-7 px-3 items-center gap-2 rounded-full bg-brand-primary text-[10px] font-black text-white uppercase tracking-widest shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      {t("active") || "Active"}
                    </div>
                  )}
                </div>

                <div className={cn(
                  "flex items-center justify-between p-5 transition-colors duration-500",
                  isActive ? "bg-brand-primary/5" : "bg-card/50"
                )}>
                  <div className="flex flex-col gap-0.5">
                    <span className={cn(
                      "text-base font-bold transition-colors",
                      isActive ? "text-brand-primary" : "text-foreground"
                    )}>
                      {option.label}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground/70">
                      {option.value === "system" ? (t("followsSystem") || "Matches system settings") : (t("tapToApply") || "Tap to set theme")}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500",
                    isActive 
                      ? "border-brand-primary bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/20" 
                      : "border-muted-foreground/20 group-hover:border-brand-primary/40"
                  )}>
                    {isActive ? (
                      <Check className="h-4 w-4 stroke-[3px]" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/20 transition-all duration-300 group-hover:bg-brand-primary/30 group-hover:scale-125" />
                    )}
                  </div>
                </div>

                {/* Bottom gloss effect when active */}
                {isActive && (
                  <div className="absolute -bottom-12 -right-12 h-24 w-24 bg-brand-primary/20 blur-3xl pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
