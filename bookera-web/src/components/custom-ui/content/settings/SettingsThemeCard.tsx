"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import ThemeLight from "@/assets/themes/light-theme-icon.svg";
import ThemeDark from "@/assets/themes/dark-theme-icon.svg";
import ThemeSystem from "@/assets/themes/system-theme-icon.svg";
import { toast } from "sonner";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun, image: ThemeLight },
  { value: "dark", label: "Dark", icon: Moon, image: ThemeDark },
  { value: "system", label: "System", icon: Monitor, image: ThemeSystem },
];

export default function SettingsThemeCard() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success("Theme updated successfully");
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl relative">
          {"Theme"}
          <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-base">
          {"Choose your preferred theme"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;

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
  );
}
