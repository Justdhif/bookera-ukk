"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Search } from "lucide-react";
interface Props {
  onChange: (params: Record<string, string | undefined>) => void;
}
export default function UserFilter({ onChange }: Props) {
  const t = useTranslations("user");
  const [searchInput, setSearchInput] = useState("");
  const [roleValue, setRoleValue] = useState<string>();
  const [statusSelect, setStatusSelect] = useState<string>();
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange({ search: searchInput || undefined });
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(e.target.value);
  const statusValue = statusSelect ?? "all";
  const handleStatusChange = (v: string) => {
    const newValue = v === "all" ? undefined : v;
    setStatusSelect(newValue);
    onChange({ status: newValue });
  };
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
      <div className="relative flex-2 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchUsers")}
          value={searchInput}
          onChange={handleSearchChange}
          className="pl-9 h-11! w-full shadow-sm transition-all duration-300"
        />
      </div>

      <div className="flex flex-row items-center gap-3 w-full sm:flex-1">
        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="flex-1 sm:w-40 h-11! shadow-sm transition-all duration-300">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
