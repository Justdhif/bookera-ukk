import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CATALOG_ROUTES = ["/categories", "/genres", "/books"];

const MANAGEMENT_ROUTES = [
  "/users",
  "/loans",
  "/returns",
  "/fines",
  "/lost-books",
  "/activity-logs",
];

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/activate";

  const isForbidden = pathname === "/forbidden";
  const isAdminRoute = !isAuthPage && !isForbidden && pathname !== "/favicon.ico";

  if (isAuthPage && token) {
    if (role === "admin" || role && role.startsWith("officer:")) {
      return NextResponse.redirect(new URL("/", req.url));
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

    if (pathname === "/") {
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
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
