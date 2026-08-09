import type { Metadata } from "next";
import type { ReactNode } from "react";
import { tokensToCssVariables } from "@mysimcha/branding";
import "@mysimcha/ui/globals.css";
import { getRequestBrand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "MySimcha Admin",
  description: "MySimcha platform administration",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const brand = await getRequestBrand();
  const cssVars = tokensToCssVariables(brand.themeTokens);

  return (
    <html lang={brand.defaultLocale} data-app="admin">
      <body className="min-h-screen bg-background font-body text-foreground antialiased" style={cssVars}>
        {children}
      </body>
    </html>
  );
}
