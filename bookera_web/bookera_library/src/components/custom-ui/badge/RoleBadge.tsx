"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
const ROLE_STYLES: Record<string, string> = {
  admin:
    "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border-red-200 dark:border-red-800",
  "officer:catalog":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "officer:management":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  user: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 border-green-200 dark:border-green-800",
};
interface RoleBadgeProps {
  role: string;
  className?: string;
}
export default function RoleBadge({ role, className }: RoleBadgeProps) {
  const t = useTranslations("profile");
  const label = (() => {
    switch (role) {
      case "admin":
        return t("roleAdmin");
      case "officer:catalog":
        return t("roleCatalogOfficer");
      case "officer:management":
        return t("roleManagementOfficer");
      default:
        return t("roleUser");
    }
  })();
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        ROLE_STYLES[role] ?? ROLE_STYLES.user,
        className,
      )}
    >
      {label}
    </Badge>
  );
}
