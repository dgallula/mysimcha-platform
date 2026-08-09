import { getRequestBrand } from "@/lib/brand";

export default async function LandingHomePage() {
  const brand = await getRequestBrand();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{brand.displayName}</p>
      <h1 className="mt-4 font-display text-5xl font-medium leading-tight">Premium digital invitations</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        Marketing experience for {brand.displayName}. Theme {brand.themeSlug}, locale {brand.defaultLocale}.
        Invitation product pages are not implemented yet.
      </p>
    </main>
  );
}
