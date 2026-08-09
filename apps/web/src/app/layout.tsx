import type { Metadata } from "next";
import type { ReactNode } from "react";
import { tokensToCssVariables } from "@mysimcha/branding";
import "@mysimcha/ui/globals.css";
import { getRequestBrand } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getRequestBrand();
  return {
    title: brand.displayName,
    description: `${brand.displayName} — digital emotional invitations`,
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const brand = await getRequestBrand();
  const cssVars = tokensToCssVariables(brand.themeTokens);

  return (
    <html lang={brand.defaultLocale} data-brand={brand.brandSlug} data-theme={brand.themeSlug}>
      <body className="min-h-screen bg-background font-body text-foreground antialiased" style={cssVars}>
        {children}
      </body>
    </html>
  );
}
