import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

function hasSessionCookie(request: NextRequest): boolean {
  return AUTH_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasSessionCookie(request);

  if (pathname.startsWith("/dashboard") && !loggedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if ((pathname === "/login" || pathname === "/register") && loggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
