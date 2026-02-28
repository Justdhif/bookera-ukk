"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface YearPickerProps {
  value?: string;
  onChange: (year: string) => void;
  placeholder?: string;
  startYear?: number;
  endYear?: number;
  className?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
}

export default function YearPicker({
  value = "",
  onChange,
  placeholder = "Pilih tahun",
  startYear = 1900,
  endYear = new Date().getFullYear(),
  className,
  disabled = false,
  searchPlaceholder = "Cari tahun...",
  emptyText = "Tahun tidak ditemukan",
}: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => endYear - i
  );

  const handleSelect = (year: string) => {
    onChange(year);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-50" />
            {value || placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-75">
              {years.map((year) => (
                <CommandItem
                  key={year}
                  value={year.toString()}
                  onSelect={() => handleSelect(year.toString())}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === year.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {year}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
