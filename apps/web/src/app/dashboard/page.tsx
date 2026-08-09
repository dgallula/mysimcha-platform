import { redirect } from "next/navigation";
import { AuthorizationError, requireActiveOrganization } from "@mysimcha/auth";
import { listMembershipsForUser } from "@mysimcha/database";
import { Button, Card } from "@mysimcha/ui";
import { logoutAction } from "@/app/actions/auth";
import { getRequestBrand } from "@/lib/brand";

export default async function DashboardPage() {
  const brand = await getRequestBrand();
  let ctx;
  try {
    ctx = await requireActiveOrganization();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/login");
    }
    throw error;
  }

  const memberships = await listMembershipsForUser(ctx.user.id);
  const active = memberships.find((m) => m.organizationId === ctx.membership.organizationId);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{brand.displayName}</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Dashboard</h1>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </header>

      <div className="grid gap-4">
        <Card>
          <h2 className="font-display text-xl">Signed in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {ctx.user.name ?? "User"} · {ctx.user.email}
          </p>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Active organization</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {active?.organization.name ?? ctx.membership.organizationId}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Role: {ctx.membership.role}</p>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Your memberships</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {memberships.map((m) => (
              <li key={m.id}>
                {m.organization.name} ({m.role})
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
