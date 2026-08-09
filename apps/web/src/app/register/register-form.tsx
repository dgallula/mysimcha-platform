"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Card, Input, Label } from "@mysimcha/ui";
import { registerAction, type AuthActionState } from "@/app/actions/auth";

const initial: AuthActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <Label className="flex flex-col gap-2">
          Your name
          <Input name="name" type="text" required autoComplete="name" />
        </Label>
        <Label className="flex flex-col gap-2">
          Email
          <Input name="email" type="email" required autoComplete="email" />
        </Label>
        <Label className="flex flex-col gap-2">
          Password
          <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Label>
        <Label className="flex flex-col gap-2">
          Organization name
          <Input name="organizationName" type="text" required />
        </Label>
        {state.error ? (
          <p role="alert" className="text-sm text-red-300">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
