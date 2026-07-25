/**
 * Brand identity vocabulary shared across apps and the branding engine.
 */

export const BRAND_SLUGS = [
  "mybatmitzvah",
  "mybarmitzvah",
  "mywedding",
  "mybritmilah",
  "mybirthday",
  "myengagement",
  "corporate",
] as const;

export type BrandSlug = (typeof BRAND_SLUGS)[number];

export type DesignTokens = {
  colors: Record<string, string>;
  fonts: {
    display: string;
    body: string;
  };
  radius: Record<string, string>;
  shadow?: Record<string, string>;
};

export type BrandContext = {
  brandId: string;
  brandSlug: BrandSlug | string;
  displayName: string;
  domains: string[];
  defaultLocale: string;
  supportedLocales: string[];
  themeId: string;
  themeSlug: string;
  themeTokens: DesignTokens;
  assetBaseUrl: string;
  templateSetId?: string;
  featureFlags: Record<string, boolean>;
};
