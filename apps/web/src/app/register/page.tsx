"use client";

import Link from "next/link";
import { useActionState, type CSSProperties } from "react";
import { registerAction, type AuthActionState } from "@/app/actions/auth";

const initial: AuthActionState = { ok: false };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <main style={styles.main}>
      <p style={styles.brand}>MySimcha</p>
      <h1 style={styles.h1}>Create account</h1>
      <form action={formAction} style={styles.form}>
        <label style={styles.label}>
          Your name
          <input name="name" type="text" required autoComplete="name" style={styles.input} />
        </label>
        <label style={styles.label}>
          Email
          <input name="email" type="email" required autoComplete="email" style={styles.input} />
        </label>
        <label style={styles.label}>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Organization name
          <input name="organizationName" type="text" required style={styles.input} />
        </label>
        {state.error ? <p style={styles.error}>{state.error}</p> : null}
        <button type="submit" disabled={pending} style={styles.button}>
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      <p style={styles.footer}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
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
    maxWidth: 420,
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
  h1: { fontSize: "1.75rem", fontWeight: 500, margin: "0.75rem 0 1.25rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.9rem" },
  label: { display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.95rem" },
  input: {
    padding: "0.65rem 0.75rem",
    border: "1px solid #8a7f6e",
    borderRadius: 2,
    fontSize: "1rem",
    fontFamily: "inherit",
    background: "#fffdf8",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    background: "#1a1a1a",
    color: "#f7f3eb",
    border: "none",
    borderRadius: 2,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "1rem",
  },
  error: { color: "#8b1e1e", margin: 0, fontSize: "0.9rem" },
  footer: { marginTop: "1.25rem", color: "#4a4338" },
};
