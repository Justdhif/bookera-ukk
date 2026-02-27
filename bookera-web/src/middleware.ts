import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CATALOG_ROUTES = ["/admin/categories", "/admin/books"];

const MANAGEMENT_ROUTES = [
  "/admin/users",
  "/admin/loans",
  "/admin/returns",
  "/admin/fines",
  "/admin/lost-books",
  "/admin/activity-logs",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";
  const isSetupProfile = pathname === "/setup-profile";
  const isAdminRoute = pathname.startsWith("/admin");

  // Allow setup-profile for authenticated users
  if (isSetupProfile && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isSetupProfile && token) {
    return NextResponse.next();
  }

  if (isAuthPage && token) {
    if (role === "admin" || role === "officer:*") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (role === "user") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!role || role === "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (role === "admin") {
      return NextResponse.next();
    }

    if (pathname === "/admin") {
      return NextResponse.next();
    }

    if (role === "officer:catalog") {
      const blocked = MANAGEMENT_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      );

      if (blocked) {
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
    }

    if (role === "officer:management") {
      const blocked = CATALOG_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      );

      if (blocked) {
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/setup-profile", "/forgot-password"],
};
