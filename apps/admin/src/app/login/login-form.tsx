"use client";

import { useActionState } from "react";
import { Button, Card, Input, Label } from "@mysimcha/ui";
import { adminLoginAction, type AdminAuthActionState } from "@/app/actions/auth";

const initial: AdminAuthActionState = { ok: false };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initial);

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
    </Card>
  );
}
