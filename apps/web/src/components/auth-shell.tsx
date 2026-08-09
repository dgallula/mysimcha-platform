import type { ReactNode } from "react";

export function AuthShell({
  brandName,
  title,
  description,
  children,
}: {
  brandName: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{brandName}</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
