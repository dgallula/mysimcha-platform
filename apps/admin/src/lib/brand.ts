import { headers } from "next/headers";
import { BRAND_REQUEST_HEADERS, resolveBrand } from "@mysimcha/branding";

export async function getRequestBrand() {
  const h = await headers();
  return resolveBrand({
    host: h.get("x-forwarded-host") ?? h.get("host"),
    brandSlug: h.get(BRAND_REQUEST_HEADERS.slug) ?? process.env.DEFAULT_BRAND,
    themeSlug: h.get(BRAND_REQUEST_HEADERS.theme) ?? process.env.DEFAULT_THEME,
    locale: h.get(BRAND_REQUEST_HEADERS.locale) ?? process.env.DEFAULT_LOCALE,
    fallbackSlug: process.env.DEFAULT_BRAND,
  });
}
