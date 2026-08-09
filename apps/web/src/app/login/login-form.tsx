"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Card, Input, Label } from "@mysimcha/ui";
import { loginAction, type AuthActionState } from "@/app/actions/auth";

const initial: AuthActionState = { ok: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <Label className="flex flex-col gap-2">
          Email
          <Input name="email" type="email" required autoComplete="email" />
        </Label>
        <Label className="flex flex-col gap-2">
          Password
          <Input name="password" type="password" required autoComplete="current-password" />
        </Label>
        {state.error ? (
          <p role="alert" className="text-sm text-red-300">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
