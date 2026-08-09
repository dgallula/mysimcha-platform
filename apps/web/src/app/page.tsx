import Link from "next/link";
import { Button } from "@mysimcha/ui";
import { getRequestBrand } from "@/lib/brand";

export default async function HomePage() {
  const brand = await getRequestBrand();

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{brand.displayName}</p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-tight tracking-tight">
          Digital emotional invitations
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Sign in to manage your organization workspace. Brand, theme, and locale follow the host.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
