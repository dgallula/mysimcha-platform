import Link from "next/link";
import type { CSSProperties } from "react";

export default function HomePage() {
  return (
    <main style={styles.main}>
      <p style={styles.brand}>MySimcha</p>
      <h1 style={styles.h1}>Digital emotional invitations</h1>
      <p style={styles.lead}>Sign in to manage your organization workspace.</p>
      <div style={styles.actions}>
        <Link href="/login" style={styles.primary}>
          Log in
        </Link>
        <Link href="/register" style={styles.secondary}>
          Create account
        </Link>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "2rem",
    maxWidth: 480,
    margin: "0 auto",
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#1a1a1a",
    background:
      "radial-gradient(ellipse at top, #f7f3eb 0%, #ebe4d6 45%, #e2d9c8 100%)",
  },
  brand: {
    fontSize: "0.85rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    margin: 0,
    color: "#5c5346",
  },
  h1: {
    fontSize: "2rem",
    fontWeight: 500,
    margin: "0.75rem 0 0.5rem",
    lineHeight: 1.2,
  },
  lead: {
    margin: "0 0 1.75rem",
    color: "#4a4338",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primary: {
    background: "#1a1a1a",
    color: "#f7f3eb",
    padding: "0.7rem 1.25rem",
    textDecoration: "none",
    borderRadius: 2,
  },
  secondary: {
    background: "transparent",
    color: "#1a1a1a",
    padding: "0.7rem 1.25rem",
    textDecoration: "none",
    border: "1px solid #1a1a1a",
    borderRadius: 2,
  },
};
