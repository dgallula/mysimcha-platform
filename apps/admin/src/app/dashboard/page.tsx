import { redirect } from "next/navigation";
import { AuthorizationError, requirePlatformRole } from "@mysimcha/auth";
import { Button, Card } from "@mysimcha/ui";
import { adminLogoutAction } from "@/app/actions/auth";

export default async function AdminDashboardPage() {
  let session;
  try {
    session = await requirePlatformRole();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">MySimcha Platform</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Admin</h1>
        </div>
        <form action={adminLogoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </header>

      <Card>
        <h2 className="font-display text-xl">Operator session</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {session.user.name ?? "Operator"} · {session.user.email}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Role: {session.user.platformRole}</p>
      </Card>
    </main>
  );
}
