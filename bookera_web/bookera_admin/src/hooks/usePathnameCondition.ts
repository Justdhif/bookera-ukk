import { usePathname } from "next/navigation";

export function usePathnameCondition() {
  const pathname = usePathname() || "";

  const isAuthPath = ["/login", "/forgot-password", "/activate", "/forbidden"].some(path => pathname.startsWith(path));
  const isAdmin = !isAuthPath;
  const isOfficer = pathname.includes("/officer");
  const isExplore = pathname.includes("/explore");

  return {
    pathname,
    isAdmin,
    isOfficer,
    isExplore,
  };
}
