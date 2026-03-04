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
    { value: "officer:catalog", label: "Catalog Officer" },
    { value: "officer:management", label: "Management Officer" },
    { value: "user", label: "User" },
  ];

  const handleRoleToggle = (value: string | null) => {
    if (value === null) {
      setRoleValue(undefined);
      onChange({ role: undefined });
    } else {
      const newValue = roleValue === value ? undefined : value;
      setRoleValue(newValue);
      onChange({ role: newValue });
    }
  };

  const handleRoleClick = (value: string | null) => {
    handleRoleToggle(value);
    const element = document.getElementById(`user-role-${value}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const isAllActive = !roleValue;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onChange({ search: e.target.value });
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={statusValue}
          onValueChange={(v) => {
            const newValue = v === "all" ? undefined : v;
            setStatusValue(newValue);
            onChange({ status: newValue });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none rounded-r-md" />

        <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
          <div id="user-role-null" className="shrink-0">
            <Badge
              variant={isAllActive ? "default" : "outline"}
              className={`
                cursor-pointer whitespace-nowrap transition-all duration-200
                px-3 py-2 text-sm font-medium
                rounded-md border
                ${
                  isAllActive
                    ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
                }
              `}
              onClick={() => handleRoleClick(null)}
            >
              <span
                className={`flex items-center gap-1.5 ${isAllActive ? "text-white" : ""}`}
              >
                All Roles
              </span>
            </Badge>
          </div>

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
                        ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                        : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
                    }
                  `}
                  onClick={() => handleRoleClick(role.value)}
                >
                  <span
                    className={`flex items-center gap-1.5 ${isActive ? "text-white" : ""}`}
                  >
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
