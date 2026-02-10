"use client";

import { AVAILABLE_ICONS } from "@/lib/icons";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function IconPicker({ value, onChange, onClear }: IconPickerProps) {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin.common');
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t('iconCategory')}</Label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {tAdmin('delete')}
          </Button>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-muted/30 max-h-75 overflow-y-auto">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {AVAILABLE_ICONS.map((iconOption) => {
            const Icon = iconOption.icon;
            const isSelected = value === iconOption.name;

            return (
              <button
                key={iconOption.name}
                type="button"
                onClick={() => onChange(iconOption.name)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:border-brand-primary hover:bg-brand-primary/10",
                  isSelected
                    ? "border-brand-primary bg-brand-primary/20"
                    : "border-transparent bg-background"
                )}
                title={iconOption.label}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                {isSelected && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('selectedIcon')}:</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
            {(() => {
              const selected = AVAILABLE_ICONS.find(i => i.name === value);
              if (selected) {
                const Icon = selected.icon;
                return (
                  <>
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{selected.label}</span>
                  </>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
