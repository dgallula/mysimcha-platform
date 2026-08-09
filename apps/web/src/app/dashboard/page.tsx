import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import {
  AuthorizationError,
  requireActiveOrganization,
} from "@mysimcha/auth";
import { listMembershipsForUser } from "@mysimcha/database";
import { logoutAction } from "@/app/actions/auth";

export default async function DashboardPage() {
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
    <main style={styles.main}>
      <header style={styles.header}>
        <div>
          <p style={styles.brand}>MySimcha</p>
          <h1 style={styles.h1}>Dashboard</h1>
        </div>
        <form action={logoutAction}>
          <button type="submit" style={styles.logout}>
            Log out
          </button>
        </form>
      </header>

      <section style={styles.section}>
        <h2 style={styles.h2}>Signed in</h2>
        <p style={styles.meta}>
          {ctx.user.name ?? "User"} · {ctx.user.email}
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Active organization</h2>
        <p style={styles.meta}>
          {active?.organization.name ?? ctx.membership.organizationId}
        </p>
        <p style={styles.meta}>Role: {ctx.membership.role}</p>
        <p style={styles.meta}>Org ID: {ctx.membership.organizationId}</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Your memberships</h2>
        <ul style={styles.list}>
          {memberships.map((m) => (
            <li key={m.id}>
              {m.organization.name} ({m.role})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    padding: "2rem",
    maxWidth: 720,
    margin: "0 auto",
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#1a1a1a",
    background:
      "radial-gradient(ellipse at top, #f7f3eb 0%, #ebe4d6 45%, #e2d9c8 100%)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
  },
  brand: {
    fontSize: "0.85rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    margin: 0,
    color: "#5c5346",
  },
  h1: { fontSize: "1.75rem", fontWeight: 500, margin: "0.5rem 0 0" },
  h2: { fontSize: "1.1rem", fontWeight: 500, margin: "0 0 0.5rem" },
  section: { marginBottom: "1.75rem" },
  meta: { margin: "0.25rem 0", color: "#4a4338" },
  list: { margin: 0, paddingLeft: "1.25rem", color: "#4a4338" },
  logout: {
    background: "transparent",
    border: "1px solid #1a1a1a",
    padding: "0.5rem 0.9rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
