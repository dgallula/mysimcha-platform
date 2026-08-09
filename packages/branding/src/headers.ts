/** Request headers set by app middleware after brand resolution. */
export const BRAND_REQUEST_HEADERS = {
  slug: "x-mysimcha-brand",
  theme: "x-mysimcha-theme",
  locale: "x-mysimcha-locale",
} as const;

export const BRAND_PREVIEW_COOKIE = "mysimcha-brand";
