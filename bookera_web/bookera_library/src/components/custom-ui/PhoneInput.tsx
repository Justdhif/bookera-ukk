"use client";
import { useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
export interface CountryCode {
  code: string;
  flag: string;
  name: string;
  dialCode: string;
}
export const COUNTRY_CODES: CountryCode[] = [
  { code: "62", flag: "🇮🇩", name: "Indonesia", dialCode: "+62" },
  { code: "60", flag: "🇲🇾", name: "Malaysia", dialCode: "+60" },
  { code: "65", flag: "🇸🇬", name: "Singapore", dialCode: "+65" },
  { code: "63", flag: "🇵🇭", name: "Philippines", dialCode: "+63" },
  { code: "66", flag: "🇹🇭", name: "Thailand", dialCode: "+66" },
  { code: "84", flag: "🇻🇳", name: "Vietnam", dialCode: "+84" },
  { code: "95", flag: "🇲🇲", name: "Myanmar", dialCode: "+95" },
  { code: "855", flag: "🇰🇭", name: "Cambodia", dialCode: "+855" },
  { code: "856", flag: "🇱🇦", name: "Laos", dialCode: "+856" },
  { code: "673", flag: "🇧🇳", name: "Brunei", dialCode: "+673" },
  { code: "1", flag: "🇺🇸", name: "United States", dialCode: "+1" },
  { code: "44", flag: "🇬🇧", name: "United Kingdom", dialCode: "+44" },
  { code: "61", flag: "🇦🇺", name: "Australia", dialCode: "+61" },
  { code: "81", flag: "🇯🇵", name: "Japan", dialCode: "+81" },
  { code: "82", flag: "🇰🇷", name: "South Korea", dialCode: "+82" },
  { code: "86", flag: "🇨🇳", name: "China", dialCode: "+86" },
  { code: "91", flag: "🇮🇳", name: "India", dialCode: "+91" },
  { code: "966", flag: "🇸🇦", name: "Saudi Arabia", dialCode: "+966" },
  { code: "971", flag: "🇦🇪", name: "UAE", dialCode: "+971" },
];
export function parsePhoneNumber(fullNumber: string): {
  countryCode: string;
  localNumber: string;
} {
  if (!fullNumber) return { countryCode: "62", localNumber: "" };
  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length,
  );
  for (const cc of sorted) {
    if (fullNumber.startsWith(cc.code)) {
      return {
        countryCode: cc.code,
        localNumber: fullNumber.slice(cc.code.length),
      };
    }
  }
  return { countryCode: "62", localNumber: fullNumber };
}
export function formatPhoneDisplay(fullNumber: string): string {
  if (!fullNumber) return "";
  const { countryCode, localNumber } = parsePhoneNumber(fullNumber);
  return `+${countryCode} ${localNumber}`;
}
interface PhoneInputProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  className,
}: PhoneInputProps) {
  const parsed = parsePhoneNumber(value || "");
  const [selectedCode, setSelectedCode] = useState(parsed.countryCode);
  const localNumber = parsed.localNumber;

  const selectedCountry =
    COUNTRY_CODES.find((cc) => cc.code === selectedCode) || COUNTRY_CODES[0];

  const handleCodeChange = (newCode: string) => {
    setSelectedCode(newCode);
    if (onChange) {
      onChange(newCode + localNumber);
    }
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocal = e.target.value.replace(/\D/g, "");
    if (onChange) {
      onChange(selectedCode + newLocal);
    }
  };

  return (
    <div className={cn("flex relative", className)}>
      <Select
        value={selectedCode}
        onValueChange={handleCodeChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "w-auto min-w-[80px] rounded-r-none border-r-0 px-2 gap-1 shrink-0",
            "focus:z-10",
          )}
        >
          <SelectValue>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="text-base leading-none">
                {selectedCountry.flag}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {selectedCountry.dialCode}
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {COUNTRY_CODES.map((cc) => (
            <SelectItem key={cc.code} value={cc.code}>
              <div className="flex items-center gap-2">
                <span className="text-base">{cc.flag}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {cc.dialCode}
                </span>
                <span className="text-sm">{cc.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        value={localNumber}
        onChange={handleLocalChange}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-l-none flex-1 min-w-0"
      />
    </div>
  );
}
