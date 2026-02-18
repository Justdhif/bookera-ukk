import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CATALOG_ROUTES = [
  "/admin",
  "/admin/categories",
  "/admin/books",
  "/admin/profile",
];

const MANAGEMENT_ROUTES = [
  "/admin",
  "/admin/users",
  "/admin/loans",
  "/admin/returns",
  "/admin/fines",
  "/admin/lost-books",
  "/admin/activity-logs",
  "/admin/profile",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!role || (role !== "admin" && !role.startsWith("officer:"))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (role === "admin") {
      return NextResponse.next();
    }

    if (role === "officer:catalog") {
      const hasAccess = CATALOG_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + "/")
      );
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL("/admin/forbidden", req.url));
      }
    }

    if (role === "officer:management") {
      const hasAccess = MANAGEMENT_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + "/")
      );
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL("/admin/forbidden", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
