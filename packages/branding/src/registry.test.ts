import { describe, expect, it } from "vitest";
import { resolveBrand, tokensToCssVariables } from "./registry";

describe("resolveBrand", () => {
  it("resolves MyBatMitzvah from host", () => {
    const brand = resolveBrand({ host: "www.mybatmitzvah.com" });
    expect(brand.brandSlug).toBe("mybatmitzvah");
    expect(brand.themeSlug).toBe("luxury-gold");
    expect(brand.defaultLocale).toBe("en");
  });

  it("prefers explicit slug over host", () => {
    const brand = resolveBrand({ host: "mybatmitzvah.com", brandSlug: "mywedding" });
    expect(brand.brandSlug).toBe("mywedding");
  });

  it("uses fallbackSlug when host is unknown", () => {
    const brand = resolveBrand({ host: "localhost:3000", fallbackSlug: "mybirthday" });
    expect(brand.brandSlug).toBe("mybirthday");
  });

  it("maps tokens to CSS variables", () => {
    const brand = resolveBrand({ brandSlug: "mybatmitzvah" });
    const vars = tokensToCssVariables(brand.themeTokens);
    expect(vars["--primary"]).toBe(brand.themeTokens.colors.primary);
    expect(vars["--font-brand-display"]).toContain("Cormorant");
  });
});
