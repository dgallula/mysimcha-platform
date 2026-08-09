import { NextResponse, type NextRequest } from "next/server";
import { applyBrandHeaders } from "@/lib/brand-middleware";

export function middleware(request: NextRequest) {
  return applyBrandHeaders(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
