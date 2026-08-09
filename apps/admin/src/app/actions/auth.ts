"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import {
  assertAuthRateLimits,
  auth,
  signIn,
  signOut,
} from "@mysimcha/auth";
import { loginSchema, RateLimitExceededError } from "@mysimcha/shared";

export type AdminAuthActionState = {
  ok: boolean;
  error?: string;
};

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function adminLoginAction(
  _prev: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  try {
    await assertAuthRateLimits({
      kind: "login",
      ip: await clientIp(),
      email: parsed.data.email,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return { ok: false, error: "Too many attempts. Please wait and try again." };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }

  const session = await auth();
  if (!session?.user?.platformRole) {
    await signOut({ redirect: false });
    return { ok: false, error: "This account is not authorized for platform admin." };
  }

  redirect("/dashboard");
}

export async function adminLogoutAction() {
  await signOut({ redirectTo: "/login" });
}
