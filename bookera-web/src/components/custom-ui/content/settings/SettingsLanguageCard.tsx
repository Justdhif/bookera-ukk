"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";
import { useLocale } from "next-intl";
import { toast } from "sonner";

const languageOptions = [
  { value: "en" as Locale, label: "English", flag: "🇺🇸", nativeName: "English" },
  { value: "id" as Locale, label: "Indonesia", flag: "🇮🇩", nativeName: "Bahasa Indonesia" },
];

export default function SettingsLanguageCard() {
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale as Locale);
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (locale: Locale) => {
    setSelectedLocale(locale);
    startTransition(() => {
      setUserLocale(locale);
      toast.success("Language updated successfully");
    });
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl relative">
          {"Language"}
          <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-base">
          {"Choose your preferred language"}
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
            <SelectTrigger id="language-select" className="w-full h-12 text-base">
              <SelectValue placeholder="Choose a language">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {languageOptions.find((l) => l.value === selectedLocale)?.flag}
                  </span>
                  <span>
                    {languageOptions.find((l) => l.value === selectedLocale)?.label}
                  </span>
                  <span className="text-muted-foreground">
                    ({languageOptions.find((l) => l.value === selectedLocale)?.nativeName})
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.nativeName}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
