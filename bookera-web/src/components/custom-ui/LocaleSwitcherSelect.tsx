"use client";

import { useState, Dispatch, SetStateAction } from 'react';
import { Locale } from '@/i18n/config';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
  setLocale: Dispatch<SetStateAction<Locale | undefined>>;
  iconOnly?: boolean;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
  setLocale,
  iconOnly = false
}: Props) {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  function onChange(value: string) {
    const locale = value as Locale;
    setSelectedValue(value);
    setLocale(locale);
  }

  const selectedItem = items.find(item => item.value === selectedValue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={iconOnly ? "icon" : "default"}
          className={iconOnly ? "h-9 w-9 rounded-full" : "flex items-center gap-2 h-9 px-3"} 
          title={label}
        >
          <Globe className="h-4 w-4" />
          {!iconOnly && (
            <span className="text-sm font-medium">
              {selectedItem?.label || label}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((option) => (
          <DropdownMenuItem 
            key={option.value} 
            onClick={() => onChange(option.value)}
            className={selectedValue === option.value ? "bg-accent" : ""}
          >
            {option.value === 'id' ? '🇮🇩' : '🇬🇧'} {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
