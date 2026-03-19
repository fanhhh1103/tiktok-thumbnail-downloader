import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./app/i18n";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Ignore Next.js internals and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Root goes to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}${search}`, req.url));
  }

  const seg = pathname.split("/")[1] ?? "";
  if (isLocale(seg)) return NextResponse.next();

  // Any non-localed path is redirected under default locale
  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}${search}`, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};

