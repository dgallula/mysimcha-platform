import { NextResponse, type NextRequest } from "next/server";
import { applyBrandHeaders } from "@/lib/brand-middleware";

const AUTH_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"] as const;
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/health"];

function hasSessionCookie(request: NextRequest): boolean {
  return AUTH_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasSessionCookie(request);

  let response = NextResponse.next();

  if (!isPublicPath(pathname) && !loggedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    response = NextResponse.redirect(login);
  } else if (pathname === "/login" && loggedIn) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return applyBrandHeaders(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
