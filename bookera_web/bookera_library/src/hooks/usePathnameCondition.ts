import { usePathname } from "next/navigation";

export function usePathnameCondition() {
  const pathname = usePathname() || "";

  const isAdmin = pathname.includes("/admin");
  const isOfficer = pathname.includes("/officer");

  return {
    pathname,
    isAdmin,
    isOfficer,
  };
}
