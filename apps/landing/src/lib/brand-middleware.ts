import type { NextRequest, NextResponse } from "next/server";
import { BRAND_REQUEST_HEADERS, resolveBrand } from "@mysimcha/branding";

export function applyBrandHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const preview = request.nextUrl.searchParams.get("brand");
  const brand = resolveBrand({
    host: request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    brandSlug: preview ?? process.env.DEFAULT_BRAND,
    themeSlug: request.nextUrl.searchParams.get("theme") ?? process.env.DEFAULT_THEME,
    locale: request.nextUrl.searchParams.get("locale") ?? process.env.DEFAULT_LOCALE,
    fallbackSlug: process.env.DEFAULT_BRAND,
  });

  response.headers.set(BRAND_REQUEST_HEADERS.slug, String(brand.brandSlug));
  response.headers.set(BRAND_REQUEST_HEADERS.theme, brand.themeSlug);
  response.headers.set(BRAND_REQUEST_HEADERS.locale, brand.defaultLocale);
  return response;
}
