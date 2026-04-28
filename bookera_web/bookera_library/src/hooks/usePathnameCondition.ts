import { usePathname } from "next/navigation";

export function usePathnameCondition() {
  const pathname = usePathname() || "";

  const isAdmin = pathname.includes("/admin");
  const isOfficer = pathname.includes("/officer");
  const isExplore = pathname.includes("/explore");

  return {
    pathname,
    isAdmin,
    isOfficer,
    isExplore,
  };
}
