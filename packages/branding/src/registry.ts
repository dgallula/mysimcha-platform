import type { BrandContext, BrandSlug, DesignTokens } from "@mysimcha/shared";

/**
 * Static brand registry for local/dev and edge resolution bootstrap.
 * Production resolution prefers BrandDomain rows in PostgreSQL + Redis cache.
 * This registry is the fallback contract — not fake business data.
 */

export type BrandDefinition = {
  slug: BrandSlug;
  displayName: string;
  domains: string[];
  defaultLocale: string;
  supportedLocales: string[];
  defaultThemeSlug: string;
  assetBaseUrl: string;
  themes: Record<string, DesignTokens>;
  featureFlags: Record<string, boolean>;
};

const luxuryGoldTokens: DesignTokens = {
  colors: {
    background: "#0c0a09",
    foreground: "#faf7f2",
    primary: "#c6a75e",
    "primary-foreground": "#1c1917",
    muted: "#292524",
    "muted-foreground": "#a8a29e",
    accent: "#e8d5a3",
    border: "#44403c",
    ring: "#c6a75e",
  },
  fonts: {
    display: '"Cormorant Garamond", "Times New Roman", serif',
    body: '"Manrope", "Segoe UI", sans-serif',
  },
  radius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
  },
};

export const BRAND_REGISTRY: Record<BrandSlug, BrandDefinition> = {
  mybatmitzvah: {
    slug: "mybatmitzvah",
    displayName: "MyBatMitzvah",
    domains: ["mybatmitzvah.com", "www.mybatmitzvah.com"],
    defaultLocale: "en",
    supportedLocales: ["en", "he", "fr"],
    defaultThemeSlug: "luxury-gold",
    assetBaseUrl: "https://assets.mybatmitzvah.com",
    themes: {
      "luxury-gold": luxuryGoldTokens,
    },
    featureFlags: {
      aiContent: true,
      whatsapp: true,
    },
  },
  mybarmitzvah: {
    slug: "mybarmitzvah",
    displayName: "MyBarMitzvah",
    domains: ["mybarmitzvah.com", "www.mybarmitzvah.com"],
    defaultLocale: "en",
    supportedLocales: ["en", "he", "fr"],
    defaultThemeSlug: "luxury-gold",
    assetBaseUrl: "https://assets.mybarmitzvah.com",
    themes: {
      "luxury-gold": luxuryGoldTokens,
    },
    featureFlags: {
      aiContent: true,
      whatsapp: true,
    },
  },
  mywedding: {
    slug: "mywedding",
    displayName: "MyWedding",
    domains: ["mywedding.com", "www.mywedding.com"],
    defaultLocale: "en",
    supportedLocales: ["en", "he", "fr", "es"],
    defaultThemeSlug: "luxury-gold",
    assetBaseUrl: "https://assets.mywedding.com",
    themes: {
      "luxury-gold": luxuryGoldTokens,
    },
    featureFlags: {
      aiContent: true,
      whatsapp: true,
    },
  },
  mybritmilah: {
    slug: "mybritmilah",
    displayName: "MyBritMilah",
    domains: ["mybritmilah.com"],
    defaultLocale: "en",
    supportedLocales: ["en", "he"],
    defaultThemeSlug: "luxury-gold",
    assetBaseUrl: "https://assets.mybritmilah.com",
    themes: { "luxury-gold": luxuryGoldTokens },
    featureFlags: { aiContent: true, whatsapp: false },
  },
  mybirthday: {
    slug: "mybirthday",
    displayName: "MyBirthday",
    domains: ["mybirthday.com"],
    defaultLocale: "en",
    supportedLocales: ["en", "fr", "es"],
    defaultThemeSlug: "luxury-gold",
    assetBaseUrl: "https://assets.mybirthday.com",
    themes: { "luxury-gold": luxuryGoldTokens },
    featureFlags: { aiContent: true, whatsapp: false },
  },
  myengagement: {
    slug: "myengagement",
    displayName: "MyEngagement",
    domains: ["myengagement.com"],
    defaultLocale: "en",
    supportedLocales: ["en", "he", "fr"],
    defaultThemeSlug: "luxury-gold",
    assetBaseUrl: "https://assets.myengagement.com",
    themes: { "luxury-gold": luxuryGoldTokens },
    featureFlags: { aiContent: true, whatsapp: true },
  },
  corporate: {
    slug: "corporate",
    displayName: "MySimcha Corporate",
    domains: ["corporate.mysimcha.com"],
    defaultLocale: "en",
    supportedLocales: ["en"],
    defaultThemeSlug: "luxury-gold",
    assetBaseUrl: "https://assets.mysimcha.com",
    themes: { "luxury-gold": luxuryGoldTokens },
    featureFlags: { aiContent: true, whatsapp: false },
  },
};

export type ResolveBrandInput = {
  host?: string | null;
  brandSlug?: string | null;
  themeSlug?: string | null;
  locale?: string | null;
};

/**
 * Resolve BrandContext from host / explicit slug.
 * Database-backed resolution will wrap this in a later phase.
 */
export function resolveBrand(input: ResolveBrandInput = {}): BrandContext {
  const host = (input.host ?? "").toLowerCase().split(":")[0] ?? "";
  let definition: BrandDefinition | undefined;

  if (input.brandSlug && input.brandSlug in BRAND_REGISTRY) {
    definition = BRAND_REGISTRY[input.brandSlug as BrandSlug];
  } else if (host) {
    definition = Object.values(BRAND_REGISTRY).find((b) =>
      b.domains.some((d) => d === host || host.endsWith(`.${d}`)),
    );
  }

  definition ??= BRAND_REGISTRY.mybatmitzvah;

  const themeSlug = input.themeSlug ?? definition.defaultThemeSlug;
  const themeTokens = definition.themes[themeSlug] ?? definition.themes[definition.defaultThemeSlug]!;

  const locale =
    input.locale && definition.supportedLocales.includes(input.locale)
      ? input.locale
      : definition.defaultLocale;

  return {
    brandId: `brand:${definition.slug}`,
    brandSlug: definition.slug,
    displayName: definition.displayName,
    domains: definition.domains,
    defaultLocale: locale,
    supportedLocales: definition.supportedLocales,
    themeId: `theme:${definition.slug}:${themeSlug}`,
    themeSlug,
    themeTokens,
    assetBaseUrl: definition.assetBaseUrl,
    featureFlags: definition.featureFlags,
  };
}

/** Map design tokens to CSS variable declarations for ThemeProvider. */
export function tokensToCssVariables(tokens: DesignTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens.colors)) {
    vars[`--${key}`] = value;
  }
  vars["--font-brand-display"] = tokens.fonts.display;
  vars["--font-brand-body"] = tokens.fonts.body;
  for (const [key, value] of Object.entries(tokens.radius)) {
    vars[`--radius-${key}`] = value;
  }
  return vars;
}
