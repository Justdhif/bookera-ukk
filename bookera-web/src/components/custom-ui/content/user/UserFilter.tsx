"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface Props {
  onChange: (params: Record<string, string | undefined>) => void;
}

export default function UserFilter({ onChange }: Props) {
  const [searchValue, setSearchValue] = useState("");
  const [roleValue, setRoleValue] = useState<string>();
  const [statusValue, setStatusValue] = useState<string>();

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "officer", label: "Petugas" },
    { value: "user", label: "User" },
  ];

  const handleRoleToggle = (value: string | null) => {
    if (value === null) {
      // Klik "Semua" - reset role
      setRoleValue(undefined);
      onChange({ role: undefined });
    } else {
      // Toggle role spesifik
      const newValue = roleValue === value ? undefined : value;
      setRoleValue(newValue);
      onChange({ role: newValue });
    }
  };

  const handleRoleClick = (value: string | null) => {
    handleRoleToggle(value);
    // Smooth scroll untuk mobile
    const element = document.getElementById(`user-role-${value}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  // "Semua" aktif ketika tidak ada role dipilih
  const isAllActive = !roleValue;

  return (
    <div className="space-y-4">
      {/* Search Bar dan Status Filter - Sejajar */}
      <div className="flex gap-3">
        {/* Search Bar - Flex Grow */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, email, atau nomor identitas..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onChange({ search: e.target.value });
            }}
            className="pl-9"
          />
        </div>

        {/* Status Select */}
        <Select
          value={statusValue}
          onValueChange={(v) => {
            const newValue = v === "all" ? undefined : v;
            setStatusValue(newValue);
            onChange({ status: newValue });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Role - Scroll Horizontal */}
      <div className="relative">
        {/* Fade effect di ujung kanan */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none rounded-r-md" />

        {/* Scroll container */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
          {/* Badge "Semua" */}
          <div id="user-role-null" className="shrink-0">
            <Badge
              variant={isAllActive ? "default" : "outline"}
              className={`
                cursor-pointer whitespace-nowrap transition-all duration-200
                px-3 py-2 text-sm font-medium
                rounded-md border
                ${
                  isAllActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
                }
              `}
              onClick={() => handleRoleClick(null)}
            >
              <span className="flex items-center gap-1.5">Semua</span>
            </Badge>
          </div>

          {/* Badge role */}
          {roles.map((role) => {
            const isActive = roleValue === role.value;
            return (
              <div
                key={role.value}
                id={`user-role-${role.value}`}
                className="shrink-0"
              >
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={`
                    cursor-pointer whitespace-nowrap transition-all duration-200
                    px-3 py-2 text-sm font-medium
                    rounded-md border
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
                    }
                  `}
                  onClick={() => handleRoleClick(role.value)}
                >
                  <span className="flex items-center gap-1.5">
                    {role.label}
                  </span>
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
